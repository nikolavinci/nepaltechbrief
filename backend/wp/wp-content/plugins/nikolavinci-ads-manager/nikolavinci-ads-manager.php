<?php
/**
 * Plugin Name: Content Automaton Ads Manager
 * Plugin URI: https://nikolavinci.com
 * Description: Advanced ad management. Third-party support (AdSense/Ezoic), UI analytics, position toggles, and responsive ad slots.
 * Version: 2.0.0
 * Author: nikolavinci
 * Author URI: https://nikolavinci.com
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Register CPT
add_action( 'init', function() {
    register_post_type( 'neptech_ad', [
        'labels' => [
            'name' => 'Ads Manager',
            'singular_name' => 'Ad',
            'add_new' => 'Add New Ad',
            'add_new_item' => 'Create New Ad',
            'edit_item' => 'Edit Ad'
        ],
        'public' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-chart-line',
        'supports' => ['title'], // Removed thumbnail to use custom uploader
    ]);
});

// 2. Admin Scripts & Styles for Uploader and UI
add_action( 'admin_enqueue_scripts', function($hook) {
    global $post_type;
    if ( $post_type === 'neptech_ad' || strpos($hook, 'ads-analytics') !== false ) {
        wp_enqueue_media();
        wp_add_inline_script('jquery', '
            jQuery(document).ready(function($){
                var mediaUploader;
                $("#upload_image_button").click(function(e) {
                    e.preventDefault();
                    if (mediaUploader) { mediaUploader.open(); return; }
                    mediaUploader = wp.media.frames.file_frame = wp.media({
                        title: "Choose Ad Creative",
                        button: { text: "Use this image" }, multiple: false
                    });
                    mediaUploader.on("select", function() {
                        var attachment = mediaUploader.state().get("selection").first().toJSON();
                        $("#ad_image_url").val(attachment.url);
                        $("#ad_image_preview").attr("src", attachment.url).show();
                    });
                    mediaUploader.open();
                });
                
                // Toggle Fields based on Ad Type
                $("input[name=\'ad_type\']").change(function(){
                    if($(this).val() === "image") {
                        $(".type-image-group").show();
                        $(".type-code-group").hide();
                    } else {
                        $(".type-image-group").hide();
                        $(".type-code-group").show();
                    }
                }).change();
            });
        ');
    }
});

// 3. Settings & Analytics Page
add_action('admin_menu', function() {
    add_submenu_page(
        'edit.php?post_type=neptech_ad',
        'Analytics & Settings',
        'Analytics & Settings',
        'manage_options',
        'ads-analytics',
        'neptech_ads_analytics_page'
    );
});

function neptech_ads_analytics_page() {
    if ( isset($_POST['neptech_save_settings']) ) {
        $settings = [
            'top' => isset($_POST['pos_top']),
            'bottom' => isset($_POST['pos_bottom']),
            'between_sections' => isset($_POST['pos_between_sections']),
            'sidebar' => isset($_POST['pos_sidebar']),
            'article_mid' => isset($_POST['pos_article_mid']),
        ];
        update_option('neptech_ad_settings', $settings);
        echo '<div class="updated"><p>Settings saved.</p></div>';
    }
    
    $settings = get_option('neptech_ad_settings', ['top'=>true, 'bottom'=>true, 'between_sections'=>true, 'sidebar'=>true, 'article_mid'=>true]);
    
    // Calculate totals
    $ads = get_posts(['post_type' => 'neptech_ad', 'posts_per_page' => -1]);
    $total_views = 0; $total_clicks = 0;
    foreach($ads as $ad) {
        $total_views += (int)get_post_meta($ad->ID, '_ad_views', true);
        $total_clicks += (int)get_post_meta($ad->ID, '_ad_clicks', true);
    }
    
    ?>
    <div class="wrap" style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); margin-top:20px;">
        <h1 style="border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:20px;">Ad Analytics & Settings</h1>
        
        <div style="display:flex; gap:20px; margin-bottom:30px;">
            <div style="flex:1; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <h3 style="margin:0 0 10px 0; color:#64748b;">Total Impressions</h3>
                <div style="font-size:32px; font-weight:bold; color:#0f172a;"><?php echo number_format($total_views); ?></div>
            </div>
            <div style="flex:1; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <h3 style="margin:0 0 10px 0; color:#64748b;">Total Clicks</h3>
                <div style="font-size:32px; font-weight:bold; color:#2563eb;"><?php echo number_format($total_clicks); ?></div>
            </div>
            <div style="flex:1; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <h3 style="margin:0 0 10px 0; color:#64748b;">Avg. CTR</h3>
                <div style="font-size:32px; font-weight:bold; color:#10b981;">
                    <?php echo $total_views > 0 ? round(($total_clicks / $total_views) * 100, 2) : 0; ?>%
                </div>
            </div>
        </div>

        <h2 style="margin-top:30px; border-bottom:1px solid #eee; padding-bottom:10px;">Global Position Toggles</h2>
        <p>Turn off specific ad zones across the entire website.</p>
        <form method="POST">
            <table class="form-table">
                <tr>
                    <th><label>Top Banner (Header)</label></th>
                    <td><input type="checkbox" name="pos_top" value="1" <?php checked(!empty($settings['top'])); ?> /> Enabled</td>
                </tr>
                <tr>
                    <th><label>Between Sections (Homepage)</label></th>
                    <td><input type="checkbox" name="pos_between_sections" value="1" <?php checked(!empty($settings['between_sections'])); ?> /> Enabled</td>
                </tr>
                <tr>
                    <th><label>Article Mid-Section (Inside Posts)</label></th>
                    <td><input type="checkbox" name="pos_article_mid" value="1" <?php checked(!empty($settings['article_mid'])); ?> /> Enabled</td>
                </tr>
                <tr>
                    <th><label>Sidebar Native (Widgets)</label></th>
                    <td><input type="checkbox" name="pos_sidebar" value="1" <?php checked(!empty($settings['sidebar'])); ?> /> Enabled</td>
                </tr>
                <tr>
                    <th><label>Bottom Banner (Footer)</label></th>
                    <td><input type="checkbox" name="pos_bottom" value="1" <?php checked(!empty($settings['bottom'])); ?> /> Enabled</td>
                </tr>
            </table>
            <input type="hidden" name="neptech_save_settings" value="1" />
            <button type="submit" class="button button-primary" style="margin-top:15px;">Save Settings</button>
        </form>
    </div>
    <?php
}

// 4. Enhanced Meta Box UI
add_action( 'add_meta_boxes', function() {
    add_meta_box( 'neptech_ad_details', 'Ad Configuration', 'neptech_ad_meta_box_html', 'neptech_ad', 'normal', 'high' );
});

function neptech_ad_meta_box_html( $post ) {
    $type = get_post_meta( $post->ID, '_ad_type', true ) ?: 'image';
    $link = get_post_meta( $post->ID, '_ad_link', true );
    $image = get_post_meta( $post->ID, '_ad_image', true );
    $code = get_post_meta( $post->ID, '_ad_code', true );
    $position = get_post_meta( $post->ID, '_ad_position', true );
    $views = (int) get_post_meta( $post->ID, '_ad_views', true );
    $clicks = (int) get_post_meta( $post->ID, '_ad_clicks', true );

    wp_nonce_field( 'neptech_ad_nonce', 'neptech_ad_nonce_val' );
    ?>
    <style>
        .neptech-ad-panel { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
        .neptech-ad-panel h4 { margin-top: 0; color: #1e293b; font-size: 14px; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;}
        .neptech-form-group { margin-bottom: 15px; }
        .neptech-form-group label { display: block; font-weight: 600; margin-bottom: 5px; color: #334155; }
        .neptech-form-group select, .neptech-form-group input[type="text"], .neptech-form-group input[type="url"], .neptech-form-group textarea { width: 100%; max-width: 100%; border-radius: 4px; border: 1px solid #cbd5e1; padding: 6px 10px; }
        .neptech-stats { display: flex; gap: 20px; }
        .neptech-stat-box { background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; flex: 1; text-align: center; }
        .neptech-stat-box strong { display: block; font-size: 24px; color: #0f172a; margin-top: 5px; }
    </style>

    <div class="neptech-ad-panel">
        <h4>1. Ad Placement & Strategy</h4>
        <div class="neptech-form-group">
            <label>Select Ad Position (Specifies responsive dimensions on frontend)</label>
            <select name="ad_position">
                <option value="top" <?php selected($position, 'top'); ?>>Top Banner (Responsive: Full width, Max Height 130px)</option>
                <option value="between_sections" <?php selected($position, 'between_sections'); ?>>Between Sections (Responsive: Full width, Max Height 130px)</option>
                <option value="article_mid" <?php selected($position, 'article_mid'); ?>>Article Mid-Section (Responsive: Inside content, 100% width)</option>
                <option value="sidebar" <?php selected($position, 'sidebar'); ?>>Sidebar Native (Responsive: Square/Vertical, Aspect 4:3 or 1:1)</option>
                <option value="bottom" <?php selected($position, 'bottom'); ?>>Bottom Banner (Responsive: Full width, Max Height 130px)</option>
            </select>
        </div>
    </div>

    <div class="neptech-ad-panel">
        <h4>2. Creative Type</h4>
        <div class="neptech-form-group" style="display: flex; gap: 15px;">
            <label><input type="radio" name="ad_type" value="image" <?php checked($type, 'image'); ?>> Direct Image / GIF (Native)</label>
            <label><input type="radio" name="ad_type" value="third_party" <?php checked($type, 'third_party'); ?>> 3rd Party Code (AdSense, Ezoic, JS)</label>
        </div>

        <!-- IMAGE GROUP -->
        <div class="type-image-group">
            <div class="neptech-form-group">
                <label>Upload Creative (Image or GIF)</label>
                <div style="display:flex; gap:10px;">
                    <input type="url" id="ad_image_url" name="ad_image_url" value="<?php echo esc_attr($image); ?>" placeholder="https://..." style="flex:1;" />
                    <button type="button" class="button" id="upload_image_button">Browse / Upload</button>
                </div>
                <img id="ad_image_preview" src="<?php echo esc_attr($image); ?>" style="max-width: 100%; max-height: 200px; margin-top: 15px; border-radius: 4px; border: 1px solid #ccc; display: <?php echo $image ? 'block' : 'none'; ?>;" />
            </div>
            <div class="neptech-form-group">
                <label>Target URL (Where should users go when they click?)</label>
                <input type="url" name="ad_link" value="<?php echo esc_attr($link); ?>" placeholder="https://client-site.com" />
            </div>
        </div>

        <!-- 3RD PARTY CODE GROUP -->
        <div class="type-code-group" style="display:none;">
            <div class="neptech-form-group">
                <label>AdSense / Ezoic / Custom HTML Code</label>
                <textarea name="ad_code" rows="8" placeholder="Paste <script> or HTML code here..."><?php echo esc_textarea($code); ?></textarea>
                <p class="description">Note: Clicks cannot be tracked natively for 3rd party scripts. Impressions will still be tracked.</p>
            </div>
        </div>
    </div>

    <div class="neptech-ad-panel">
        <h4>3. Live Performance Analytics</h4>
        <div class="neptech-stats">
            <div class="neptech-stat-box">
                Total Impressions (Views)
                <strong><?php echo $views; ?></strong>
            </div>
            <div class="neptech-stat-box">
                Total Clicks
                <strong><?php echo $clicks; ?></strong>
            </div>
            <div class="neptech-stat-box">
                Click-Through Rate (CTR)
                <strong><?php echo $views > 0 ? round(($clicks/$views)*100, 2) : 0; ?>%</strong>
            </div>
        </div>
    </div>
    <?php
}

add_action( 'save_post', function( $post_id ) {
    if ( ! isset( $_POST['neptech_ad_nonce_val'] ) || ! wp_verify_nonce( $_POST['neptech_ad_nonce_val'], 'neptech_ad_nonce' ) ) return;
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    if ( isset( $_POST['ad_type'] ) ) update_post_meta( $post_id, '_ad_type', sanitize_text_field($_POST['ad_type']) );
    if ( isset( $_POST['ad_link'] ) ) update_post_meta( $post_id, '_ad_link', sanitize_text_field($_POST['ad_link']) );
    if ( isset( $_POST['ad_image_url'] ) ) update_post_meta( $post_id, '_ad_image', esc_url_raw($_POST['ad_image_url']) );
    if ( isset( $_POST['ad_code'] ) ) update_post_meta( $post_id, '_ad_code', $_POST['ad_code'] ); // allow html/js
    if ( isset( $_POST['ad_position'] ) ) update_post_meta( $post_id, '_ad_position', sanitize_text_field($_POST['ad_position']) );
});

// 5. REST Endpoints
add_action( 'rest_api_init', function () {
    register_rest_route( 'neptech/v1', '/ads', [
        'methods' => 'GET',
        'callback' => 'neptech_get_ads_api',
        'permission_callback' => '__return_true'
    ]);

    register_rest_route( 'neptech/v1', '/ads/click/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'neptech_track_click_api',
        'permission_callback' => '__return_true'
    ]);
});

function neptech_get_ads_api( $request ) {
    $position = $request->get_param('position');
    
    // Check Global Settings
    $settings = get_option('neptech_ad_settings', ['top'=>true, 'bottom'=>true, 'between_sections'=>true, 'sidebar'=>true, 'article_mid'=>true]);
    if ( $position && empty($settings[$position]) ) {
        return rest_ensure_response(['disabled' => true]);
    }
    
    $args = [
        'post_type' => 'neptech_ad',
        'post_status' => 'publish',
        'posts_per_page' => 1,
        'orderby' => 'rand',
    ];
    
    if ( $position ) {
        $args['meta_query'] = [['key' => '_ad_position', 'value' => $position, 'compare' => '=']];
    }

    $ads = get_posts( $args );
    if ( empty( $ads ) ) return rest_ensure_response( null );

    $ad = $ads[0];
    
    // Increment Impressions
    $views = (int) get_post_meta( $ad->ID, '_ad_views', true );
    update_post_meta( $ad->ID, '_ad_views', $views + 1 );

    $type = get_post_meta( $ad->ID, '_ad_type', true ) ?: 'image';

    return rest_ensure_response([
        'id' => $ad->ID,
        'type' => $type,
        'title' => $ad->post_title,
        'image_url' => get_post_meta( $ad->ID, '_ad_image', true ),
        'code' => get_post_meta( $ad->ID, '_ad_code', true ),
        'click_url' => get_rest_url( null, 'neptech/v1/ads/click/' . $ad->ID )
    ]);
}

function neptech_track_click_api( $request ) {
    $ad_id = $request->get_param('id');
    if ( get_post_type( $ad_id ) === 'neptech_ad' ) {
        $clicks = (int) get_post_meta( $ad_id, '_ad_clicks', true );
        update_post_meta( $ad_id, '_ad_clicks', $clicks + 1 );
        $link = get_post_meta( $ad_id, '_ad_link', true );
        if ( ! empty( $link ) ) { wp_redirect( $link ); exit; }
    }
    wp_redirect( home_url() );
    exit;
}
