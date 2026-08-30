<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_Rest_Bridge {
    public function __construct() {
        add_action('rest_api_init', [ $this, 'register_routes' ]);
        add_action('wp_ajax_ca_send_command', [ $this, 'ajax_send_command' ]);
    }

    public function ajax_send_command() {
        $cmd = sanitize_text_field($_POST['command']);
        $webhook = get_option('ca_webhook_url');
        if(!$webhook) wp_send_json_error("No webhook configured.");
        
        $response = wp_remote_post($webhook, [
            'body' => json_encode(['command' => $cmd]),
            'headers' => ['Content-Type' => 'application/json'],
            'timeout' => 5
        ]);
        
        if (is_wp_error($response)) wp_send_json_error($response->get_error_message());
        wp_send_json_success("Command '$cmd' successfully sent to Python server.");
    }

    public function register_routes() {
        // Legacy Python Publish Route
        register_rest_route( 'ca/v1', '/publish', [
            'methods' => 'POST',
            'callback' => [ $this, 'api_publish_post' ],
            'permission_callback' => function () { return current_user_can('publish_posts'); }
        ]);
        
        // Log Route
        register_rest_route( 'ca/v1', '/log', [
            'methods' => 'POST',
            'callback' => [ $this, 'api_log' ],
            'permission_callback' => '__return_true'
        ]);
    }

    public function api_log( WP_REST_Request $request ) {
        global $wpdb;
        $msg = sanitize_text_field($request->get_param('message'));
        if(!$msg) return new WP_Error('no_msg', 'Message required', ['status'=>400]);
        
        $wpdb->insert(
            $wpdb->prefix . 'ca_logs',
            [ 'action' => 'external_log', 'message' => $msg, 'level' => 'INFO' ],
            [ '%s', '%s', '%s' ]
        );
        return rest_ensure_response(['success'=>true]);
    }

    public function api_publish_post( WP_REST_Request $request ) {
        $params = $request->get_json_params();
        
        $post_data = [
            'post_title'    => sanitize_text_field( $params['title'] ?? 'Untitled' ),
            'post_content'  => wp_kses_post( $params['content'] ?? '' ),
            'post_excerpt'  => sanitize_text_field( $params['excerpt'] ?? '' ),
            'post_status'   => sanitize_text_field( $params['status'] ?? 'draft' ),
            'post_type'     => 'post',
            'post_author'   => get_current_user_id()
        ];
        
        $post_id = wp_insert_post( $post_data, true );
        if ( is_wp_error( $post_id ) ) return new WP_Error( 'post_creation_failed', $post_id->get_error_message(), ['status' => 500] );

        // Assign Categories and Tags
        if ( !empty($params['categories']) ) wp_set_post_categories( $post_id, array_map('intval', $params['categories']) );
        if ( !empty($params['tags']) ) wp_set_post_tags( $post_id, array_map('sanitize_text_field', $params['tags']) );

        // Inject AEO/SEO Metadata (To be consumed by Next.js)
        if ( !empty($params['meta_description']) ) {
            update_post_meta($post_id, '_ai_meta_description', sanitize_text_field($params['meta_description']));
        }
        if ( !empty($params['focus_keywords']) ) {
            update_post_meta($post_id, '_ai_focus_keyword', sanitize_text_field($params['focus_keywords']));
        }
        if ( !empty($params['entities']) ) {
            update_post_meta($post_id, '_ai_extracted_entities', wp_slash(json_encode($params['entities'])));
        }

        // Sideload Featured Image
        $image_url = $params['featured_image_url'] ?? '';
        if ( ! empty( $image_url ) && filter_var( $image_url, FILTER_VALIDATE_URL ) ) {
            require_once( ABSPATH . 'wp-admin/includes/media.php' );
            require_once( ABSPATH . 'wp-admin/includes/file.php' );
            require_once( ABSPATH . 'wp-admin/includes/image.php' );
            
            $image_id = media_sideload_image( $image_url, $post_id, $post_data['post_title'], 'id' );
            if ( ! is_wp_error( $image_id ) ) set_post_thumbnail( $post_id, $image_id );
        }

        return rest_ensure_response( [ 'success' => true, 'post_id' => $post_id, 'url' => get_permalink( $post_id ) ] );
    }
}