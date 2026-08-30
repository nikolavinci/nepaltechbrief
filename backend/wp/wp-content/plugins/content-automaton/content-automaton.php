<?php
/**
 * Plugin Name: Content Automaton
 * Plugin URI: https://nikolavinci.com
 * Description: Seamlessly integrates the Python AI News Aggregator with WordPress. Includes dashboard UI to trigger fetches and view live progress.
 * Version: 1.1.0
 * Author: nikolavinci
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Add Menu
add_action('admin_menu', function() {
    add_menu_page(
        'Automaton',
        'Automaton',
        'manage_options',
        'content-automaton',
        'ca_automaton_admin_page',
        'dashicons-admin-network',
        100
    );
});

// Admin Page UI
function ca_automaton_admin_page() {
    if (isset($_POST['ca_save_settings'])) {
        update_option('ca_webhook_url', esc_url_raw($_POST['ca_webhook_url']));
        echo '<div class="notice notice-success is-dismissible"><p>Settings saved.</p></div>';
    }
    
    $webhook_url = get_option('ca_webhook_url', '');
    ?>
    <div class="wrap">
        <h1 style="color:#0f172a; margin-bottom:20px;">Content Automaton Dashboard</h1>
        
        <div style="display:flex; gap:30px;">
            <!-- Left Side: Controls -->
            <div style="flex:1; background:#fff; padding:20px; border:1px solid #ccc; border-radius:8px;">
                <h2 style="margin-top:0;">Configuration</h2>
                <form method="post">
                    <table class="form-table">
                        <tr>
                            <th><label>Python Webhook URL</label></th>
                            <td>
                                <input type="url" name="ca_webhook_url" value="<?php echo esc_attr($webhook_url); ?>" style="width:100%;" placeholder="e.g. https://my-python-server.com/trigger">
                                <p class="description">The URL to ping when starting/stopping the AI aggregator.</p>
                            </td>
                        </tr>
                    </table>
                    <input type="hidden" name="ca_save_settings" value="1">
                    <button type="submit" class="button button-primary">Save Settings</button>
                </form>

                <h2 style="margin-top:40px; border-top:1px solid #eee; padding-top:20px;">Execution Control</h2>
                <p>Trigger your external Python application to start fetching and generating news.</p>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="ca-btn-start" class="button button-primary" style="background:#10b981; border-color:#059669;">▶ Start Fetch / Run</button>
                    <button id="ca-btn-stop" class="button" style="color:#ef4444; border-color:#ef4444;">⏹ Stop Process</button>
                </div>
                <div id="ca-action-msg" style="margin-top:15px; font-weight:bold;"></div>
            </div>

            <!-- Right Side: Live Logs -->
            <div style="flex:1; background:#1e293b; color:#f8fafc; padding:20px; border-radius:8px; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:10px; margin-bottom:10px;">
                    <h2 style="margin:0; color:#f8fafc;">Live Progress / Logs</h2>
                    <button id="ca-btn-clear" class="button button-small">Clear</button>
                </div>
                <div id="ca-logs" style="flex:1; font-family:monospace; font-size:12px; overflow-y:auto; max-height:400px; padding-right:10px;">
                    <div style="color:#94a3b8;">Waiting for updates from Python aggregator...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
    jQuery(document).ready(function($) {
        var webhookUrl = "<?php echo esc_js($webhook_url); ?>";
        
        function sendCommand(cmd) {
            if(!webhookUrl) {
                $('#ca-action-msg').css('color','red').text("Please configure the Python Webhook URL first.");
                return;
            }
            $('#ca-action-msg').css('color','orange').text("Sending command: " + cmd + "...");
            
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'ca_send_command',
                    command: cmd
                },
                success: function(res) {
                    if(res.success) {
                        $('#ca-action-msg').css('color','green').text(res.data);
                    } else {
                        $('#ca-action-msg').css('color','red').text("Failed: " + res.data);
                    }
                },
                error: function() {
                    $('#ca-action-msg').css('color','red').text("Network error while sending command.");
                }
            });
        }

        $('#ca-btn-start').click(function(){ sendCommand('start'); });
        $('#ca-btn-stop').click(function(){ sendCommand('stop'); });
        
        // Polling logs
        function fetchLogs() {
            $.post(ajaxurl, { action: 'ca_get_logs' }, function(res) {
                if(res.success && res.data.length > 0) {
                    var html = '';
                    res.data.forEach(function(log) {
                        var color = '#f8fafc';
                        if(log.includes('ERROR') || log.includes('FAILED')) color = '#ef4444';
                        if(log.includes('SUCCESS') || log.includes('PUBLISHED')) color = '#10b981';
                        html += '<div style="margin-bottom:5px; color:'+color+';"><span style="color:#64748b;">['+log.time+']</span> '+log.message+'</div>';
                    });
                    $('#ca-logs').html(html);
                }
            });
        }
        setInterval(fetchLogs, 3000); // Poll every 3 seconds
        
        $('#ca-btn-clear').click(function() {
            $.post(ajaxurl, { action: 'ca_clear_logs' }, function() {
                $('#ca-logs').html('<div style="color:#94a3b8;">Logs cleared.</div>');
            });
        });
    });
    </script>
    <?php
}

// AJAX Command Sender
add_action('wp_ajax_ca_send_command', function() {
    $cmd = $_POST['command'];
    $webhook = get_option('ca_webhook_url');
    if(!$webhook) wp_send_json_error("No webhook configured.");
    
    // We send a POST to the Python webhook
    $response = wp_remote_post($webhook, [
        'body' => json_encode(['command' => $cmd]),
        'headers' => ['Content-Type' => 'application/json'],
        'timeout' => 5
    ]);
    
    if (is_wp_error($response)) {
        wp_send_json_error($response->get_error_message());
    }
    
    wp_send_json_success("Command '$cmd' successfully sent to Python server.");
});

// Log System
// The Python script will POST to /wp-json/ca/v1/log to update the UI
add_action('rest_api_init', function () {
    register_rest_route('ca/v1', '/log', array(
        'methods' => 'POST',
        'callback' => function(WP_REST_Request $request) {
            $msg = sanitize_text_field($request->get_param('message'));
            if(!$msg) return new WP_Error('no_msg', 'Message required', ['status'=>400]);
            
            $logs = get_option('ca_automaton_logs', []);
            if(!is_array($logs)) $logs = [];
            
            // Keep last 100 logs
            if(count($logs) > 100) array_shift($logs);
            
            $logs[] = [
                'time' => current_time('H:i:s'),
                'message' => $msg
            ];
            
            update_option('ca_automaton_logs', $logs);
            return rest_ensure_response(['success'=>true]);
        },
        'permission_callback' => '__return_true'
    ));

    // Keep the existing publish endpoint
    register_rest_route( 'ca/v1', '/publish', array(
        'methods' => 'POST',
        'callback' => 'ca_automaton_publish_post',
        'permission_callback' => function () { return current_user_can( 'publish_posts' ); }
    ) );
});

// AJAX Get Logs
add_action('wp_ajax_ca_get_logs', function() {
    $logs = get_option('ca_automaton_logs', []);
    wp_send_json_success(array_reverse($logs)); // newest first or oldest first? let's do oldest first so it scrolls naturally, wait, we do newest first for easy viewing
});

add_action('wp_ajax_ca_clear_logs', function() {
    update_option('ca_automaton_logs', []);
    wp_send_json_success();
});


// ORIGINAL PUBLISH FUNCTION
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

    // 3. SEO Metadata Injection
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
        }
    }

    return rest_ensure_response( array(
        'success' => true,
        'post_id' => $post_id,
        'url'     => get_permalink( $post_id )
    ) );
}
