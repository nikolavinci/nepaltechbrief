<?php
/**
 * Plugin Name: Content Automaton
 * Plugin URI: https://nikolavinci.com
 * Description: Seamlessly integrates the Python AI News Aggregator with WordPress. Handles featured image sideloading and SEO metadata injection.
 * Version: 1.0.0
 * Author: nikolavinci
 * Author URI: https://nikolavinci.com
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Add a simple menu so the user can see it's installed
add_action('admin_menu', function() {
    add_menu_page(
        'Content Automaton',
        'Content Automaton',
        'manage_options',
        'content-automaton',
        function() {
            echo '<div class="wrap"><h1>Content Automaton</h1>';
            echo '<p>By <a href="https://nikolavinci.com" target="_blank">nikolavinci</a></p>';
            echo '<p>The REST API Bridge is currently <strong>ACTIVE</strong> and listening for payloads from your Python application.</p>';
            echo '<p>Endpoint: <code>/wp-json/ca/v1/publish</code></p>';
            echo '</div>';
        },
        'dashicons-admin-network',
        100
    );
});

add_action( 'rest_api_init', function () {
    register_rest_route( 'ca/v1', '/publish', array(
        'methods' => 'POST',
        'callback' => 'ca_automaton_publish_post',
        'permission_callback' => function () {
            return current_user_can( 'publish_posts' );
        }
    ) );
} );

function ca_automaton_publish_post( WP_REST_Request $request ) {
    $params = $request->get_json_params();
    
    // 1. Create the Post
    $post_data = array(
        'post_title'    => sanitize_text_field( $params['title'] ?? 'Untitled' ),
        'post_content'  => wp_kses_post( $params['content'] ?? '' ),
        'post_excerpt'  => sanitize_text_field( $params['excerpt'] ?? '' ),
        'post_status'   => sanitize_text_field( $params['status'] ?? 'draft' ),
        'post_type'     => 'post',
        'post_author'   => get_current_user_id()
    );
    
    $post_id = wp_insert_post( $post_data, true );
    
    if ( is_wp_error( $post_id ) ) {
        return new WP_Error( 'post_creation_failed', $post_id->get_error_message(), array( 'status' => 500 ) );
    }

    // 2. Assign Categories and Tags
    if ( ! empty( $params['categories'] ) && is_array( $params['categories'] ) ) {
        wp_set_post_categories( $post_id, array_map( 'intval', $params['categories'] ) );
    }
    
    if ( ! empty( $params['tags'] ) && is_array( $params['tags'] ) ) {
        wp_set_post_tags( $post_id, array_map( 'sanitize_text_field', $params['tags'] ) );
    }

    // 3. SEO Metadata Injection (RankMath & Yoast)
    if ( ! empty( $params['meta_description'] ) ) {
        $desc = sanitize_text_field( $params['meta_description'] );
        update_post_meta( $post_id, 'rank_math_description', $desc );
        update_post_meta( $post_id, '_yoast_wpseo_metadesc', $desc );
    }
    
    if ( ! empty( $params['focus_keywords'] ) ) {
        $keywords = sanitize_text_field( $params['focus_keywords'] );
        update_post_meta( $post_id, 'rank_math_focus_keyword', $keywords );
        update_post_meta( $post_id, '_yoast_wpseo_focuskw', $keywords );
    }

    // 4. Smoothly Sideload Featured Image
    $image_url = $params['featured_image_url'] ?? '';
    if ( ! empty( $image_url ) && filter_var( $image_url, FILTER_VALIDATE_URL ) ) {
        require_once( ABSPATH . 'wp-admin/includes/media.php' );
        require_once( ABSPATH . 'wp-admin/includes/file.php' );
        require_once( ABSPATH . 'wp-admin/includes/image.php' );
        
        $image_id = media_sideload_image( $image_url, $post_id, $post_data['post_title'], 'id' );
        
        if ( ! is_wp_error( $image_id ) ) {
            set_post_thumbnail( $post_id, $image_id );
        } else {
            // Log error silently if image fails
            error_log( 'CA Bridge Image Error: ' . $image_id->get_error_message() );
        }
    }

    return rest_ensure_response( array(
        'success' => true,
        'post_id' => $post_id,
        'url'     => get_permalink( $post_id )
    ) );
}
