<?php
/**
 * Plugin Name: Content Automaton Ads Manager
 * Plugin URI: https://nikolavinci.com
 * Description: Advanced ad management. Third-party support (AdSense/Ezoic), UI analytics, position toggles, and responsive ad slots.
 * Version: 2.4.0
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
                    mediaUploader = wp.media.frames.file_frame = wp.media({ title: "Choose Desktop Image" });
                    mediaUploader.on("select", function() {
                        var attachment = mediaUploader.state().get("selection").first().toJSON();
                        $("#ad_image_url").val(attachment.url);
                        $("#ad_image_preview").attr("src", attachment.url).show();
                    });
                    mediaUploader.open();
                });

                var mediaUploaderMobile;
                $("#upload_mobile_image_button").click(function(e) {
                    e.preventDefault();
                    if (mediaUploaderMobile) { mediaUploaderMobile.open(); return; }
                    mediaUploaderMobile = wp.media.frames.file_frame = wp.media({ title: "Choose Mobile Image" });
                    mediaUploaderMobile.on("select", function() {
                        var attachment = mediaUploaderMobile.state().get("selection").first().toJSON();
                        $("#ad_mobile_image_url").val(attachment.url);
                        $("#ad_mobile_image_preview").attr("src", attachment.url).show();
                    });
                    mediaUploaderMobile.open();
                });
                
                // Toggle Fields based on Ad Type
                $(".type-code-group").hide();
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
    add_submenu_page('edit.php?post_type=neptech_ad', 'Dashboard Overview', 'Overview', 'manage_options', 'ads-analytics', 'neptech_ads_dashboard_page');
    add_submenu_page('edit.php?post_type=neptech_ad', 'Global Settings & Guide', 'Settings & Guide', 'manage_options', 'ads-settings', 'neptech_ads_settings_page');
});


function neptech_ads_dashboard_page() {
    $ads = get_posts(['post_type' => 'neptech_ad', 'numberposts' => -1]);
    $total_views = 0; $total_clicks = 0;
    foreach($ads as $ad) {
        $total_views += (int) get_post_meta($ad->ID, '_ad_views', true);
        $total_clicks += (int) get_post_meta($ad->ID, '_ad_clicks', true);
    }
    ?>
    <div class="wrap">
        <h1 style="color:#0f172a; margin-bottom:20px;">NepTechBrief Ads Overview</h1>
        
        <div style="display:flex; gap:20px; max-width:800px; margin-bottom:30px;">
            <div style="flex:1; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <h3 style="margin:0 0 10px 0; color:#64748b;">Total Network Impressions</h3>
                <div style="font-size:32px; font-weight:bold; color:#0f172a;"><?php echo number_format($total_views); ?></div>
            </div>
            <div style="flex:1; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <h3 style="margin:0 0 10px 0; color:#64748b;">Total Network Clicks</h3>
                <div style="font-size:32px; font-weight:bold; color:#2563eb;"><?php echo number_format($total_clicks); ?></div>
            </div>
            <div style="flex:1; background:#f8fafc; padding:20px; border-radius:8px; border:1px solid #e2e8f0; text-align:center;">
                <h3 style="margin:0 0 10px 0; color:#64748b;">Network CTR</h3>
                <div style="font-size:32px; font-weight:bold; color:#10b981;">
                    <?php echo $total_views > 0 ? round(($total_clicks / $total_views) * 100, 2) : 0; ?>%
                </div>
            </div>
        </div>

        <h2 style="margin-top:30px; border-bottom:1px solid #eee; padding-bottom:10px;">Active Ad Campaigns</h2>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th>Ad Name</th>
                    <th>Positions</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                </tr>
            </thead>
            <tbody>
                <?php if(!$ads) echo '<tr><td colspan="5">No ads found.</td></tr>'; ?>
                <?php foreach($ads as $ad): 
                    $v = (int) get_post_meta($ad->ID, '_ad_views', true);
                    $c = (int) get_post_meta($ad->ID, '_ad_clicks', true);
                    $pos = get_post_meta($ad->ID, '_ad_position', true);
                    if(!is_array($pos)) $pos = [$pos];
                ?>
                <tr>
                    <td><strong><a href="<?php echo get_edit_post_link($ad->ID); ?>"><?php echo esc_html($ad->post_title); ?></a></strong></td>
                    <td><?php echo esc_html(implode(', ', array_filter($pos))); ?></td>
                    <td><?php echo number_format($v); ?></td>
                    <td><?php echo number_format($c); ?></td>
                    <td><?php echo $v > 0 ? round(($c/$v)*100,2) : 0; ?>%</td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
}

function neptech_ads_settings_page() {
    if ( isset($_POST['neptech_save_settings']) ) {
        $settings = [];
        foreach(['top','bottom','between_sections','sidebar','ad_below_title_1','ad_below_title_2','ad_below_featured_1','ad_below_featured_2','ad_mid_1','ad_mid_2','ad_bottom_1','ad_bottom_2'] as $p) {
            $settings[$p] = isset($_POST['pos_'.$p]);
        }
        update_option('neptech_ad_settings', $settings);
        echo '<div class="notice notice-success is-dismissible"><p>Settings saved!</p></div>';
    }
    $settings = get_option('neptech_ad_settings', []);
    ?>
    <div class="wrap">
        <h1 style="color:#0f172a; margin-bottom:20px;">Global Position Toggles & Guidelines</h1>
        <p>Turn off specific ad zones across the entire website.</p>
        <form method="POST">
            <table class="form-table">
                <tr><th><label>Top Banner (Header)</label></th><td><input type="checkbox" name="pos_top" value="1" <?php checked(!empty($settings['top'])); ?> /> Enabled</td></tr>
                <tr><th><label>Between Sections (Homepage)</label></th><td><input type="checkbox" name="pos_between_sections" value="1" <?php checked(!empty($settings['between_sections'])); ?> /> Enabled</td></tr>
                <tr><th><label>Sidebar Native (Widgets)</label></th><td><input type="checkbox" name="pos_sidebar" value="1" <?php checked(!empty($settings['sidebar'])); ?> /> Enabled</td></tr>
                
                <tr><th colspan="2" style="background:#e2e8f0; padding:10px;">Article Inner Ads</th></tr>
                <tr><th><label>Ad 1: Below the Title</label></th><td><input type="checkbox" name="pos_ad_below_title_1" value="1" <?php checked(!empty($settings['ad_below_title_1'])); ?> /> Enabled</td></tr>
                <tr><th><label>Ad 2: Below Ad 1</label></th><td><input type="checkbox" name="pos_ad_below_title_2" value="1" <?php checked(!empty($settings['ad_below_title_2'])); ?> /> Enabled</td></tr>
                <tr><th><label>Ad 3: Below Featured Image</label></th><td><input type="checkbox" name="pos_ad_below_featured_1" value="1" <?php checked(!empty($settings['ad_below_featured_1'])); ?> /> Enabled</td></tr>
                <tr><th><label>Ad 4: Below Ad 3</label></th><td><input type="checkbox" name="pos_ad_below_featured_2" value="1" <?php checked(!empty($settings['ad_below_featured_2'])); ?> /> Enabled</td></tr>
                <tr><th><label>Ad 5: Square Mid-Article 1</label></th><td><input type="checkbox" name="pos_ad_mid_1" value="1" <?php checked(!empty($settings['ad_mid_1'])); ?> /> Enabled</td></tr>
                <tr><th><label>Ad 6: Square Mid-Article 2</label></th><td><input type="checkbox" name="pos_ad_mid_2" value="1" <?php checked(!empty($settings['ad_mid_2'])); ?> /> Enabled</td></tr>
                <tr><th><label>Ad 7: End of Article (Below Author)</label></th><td><input type="checkbox" name="pos_ad_bottom_1" value="1" <?php checked(!empty($settings['ad_bottom_1'])); ?> /> Enabled</td></tr>
                <tr><th><label>Ad 8: Below Ad 7</label></th><td><input type="checkbox" name="pos_ad_bottom_2" value="1" <?php checked(!empty($settings['ad_bottom_2'])); ?> /> Enabled</td></tr>
            </table>
            <input type="hidden" name="neptech_save_settings" value="1" />
            <button type="submit" class="button button-primary" style="margin-top:15px;">Save Settings</button>
        </form>

        <h2 style="margin-top:40px;">Visual Guide & Dimensions</h2>
        <div style="background: #fff; padding: 20px; border: 1px solid #ccc; margin-top: 15px; border-radius: 6px;">
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="font-size:14px;">Ad Slot Name</th>
                        <th style="font-size:14px;">Desktop Dimensions</th>
                        <th style="font-size:14px;">Mobile / Tablet Dimensions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td><strong>Top Banner (Header)</strong></td><td>728x90 or 730x200 px</td><td>320x100 px</td></tr>
                    <tr><td><strong>Between Sections (Homepage)</strong></td><td>760x115 px</td><td>320x100 px</td></tr>
                    <tr><td><strong>Sidebar Native</strong></td><td>300x250 or 300x600 px</td><td>300x250 px</td></tr>
                    <tr><td><strong>Ad 1 & 2 (Below Title)</strong></td><td>730x200 px</td><td>320x100 px</td></tr>
                    <tr><td><strong>Ad 3 & 4 (Below Featured Image)</strong></td><td>730x200 px</td><td>320x100 px</td></tr>
                    <tr><td><strong>Ad 5 & 6 (Square Mid-Article)</strong></td><td>250x250 or 300x250 px</td><td>250x250 px (Stacked)</td></tr>
                    <tr><td><strong>Ad 7 & 8 (Below Author Box)</strong></td><td>730x200 px</td><td>320x100 px</td></tr>
                </tbody>
            </table>
        </div>

        <div style="display:flex; gap:30px; margin-top:30px;">
            <div style="flex:1; background:#fff; padding:20px; border:1px solid #ccc; max-width:400px; text-align:center; border-radius:8px;">
                <h3>Homepage Layout</h3>
                <div style="border:2px dashed #0369a1; background:#e0f2fe; padding:10px; margin:10px 0; font-weight:bold;">Top Banner</div>
                <div style="background:#f1f5f9; padding:20px; margin:10px 0; height:80px;">Latest News Grid</div>
                <div style="border:2px dashed #0369a1; background:#e0f2fe; padding:10px; margin:10px 0; font-weight:bold;">Between Sections</div>
                <div style="background:#f1f5f9; padding:20px; margin:10px 0; height:80px;">Category Sections</div>
            </div>

            <div style="flex:1; background:#fff; padding:20px; border:1px solid #ccc; max-width:400px; text-align:center; border-radius:8px;">
                <h3>Article Layout</h3>
                <div style="background:#f1f5f9; padding:10px; margin:10px 0; font-size:20px; font-weight:bold;">Article Title</div>
                <div style="border:2px dashed #15803d; background:#dcfce7; padding:10px; margin:5px 0;">Ad 1 (Below Title)</div>
                <div style="border:2px dashed #15803d; background:#dcfce7; padding:10px; margin:5px 0;">Ad 2 (Below Ad 1)</div>
                <div style="background:#e2e8f0; padding:20px; margin:10px 0; height:100px;">Featured Image</div>
                <div style="border:2px dashed #15803d; background:#dcfce7; padding:10px; margin:5px 0;">Ad 3 (Below Featured Image)</div>
                <div style="border:2px dashed #15803d; background:#dcfce7; padding:10px; margin:5px 0;">Ad 4 (Below Ad 3)</div>
                
                <div style="background:#f8fafc; padding:20px; margin:10px 0; text-align:left; font-size:12px; color:#666;">
                    [Article Text]...<br>
                    <div style="display:flex; gap:10px; margin:10px 0;">
                        <div style="flex:1; border:2px dashed #15803d; background:#dcfce7; padding:20px; text-align:center;">Ad 5 (Mid)</div>
                        <div style="flex:1; border:2px dashed #15803d; background:#dcfce7; padding:20px; text-align:center;">Ad 6 (Mid)</div>
                    </div>
                    [Article Text]...
                </div>

                <div style="border:2px dashed #15803d; background:#dcfce7; padding:10px; margin:5px 0;">Ad 7 (End of Article)</div>
                <div style="border:2px dashed #15803d; background:#dcfce7; padding:10px; margin:5px 0;">Ad 8 (Below Ad 7)</div>
            </div>
        </div>
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
    $image_mobile = get_post_meta( $post->ID, '_ad_image_mobile', true );
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
            <label>Select Ad Positions (Check all that apply)</label>
            <?php $positions = is_array($position) ? $position : ( $position ? [$position] : [] ); ?>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top:10px;">
                <label><input type="checkbox" name="ad_position[]" value="top" <?php checked(in_array('top', $positions)); ?>> Top Banner (Header)</label>
                <label><input type="checkbox" name="ad_position[]" value="between_sections" <?php checked(in_array('between_sections', $positions)); ?>> Between Sections (Homepage)</label>
                <label><input type="checkbox" name="ad_position[]" value="sidebar" <?php checked(in_array('sidebar', $positions)); ?>> Sidebar Native</label>
                
                <label><input type="checkbox" name="ad_position[]" value="ad_below_title_1" <?php checked(in_array('ad_below_title_1', $positions)); ?>> Ad 1 (Below Title)</label>
                <label><input type="checkbox" name="ad_position[]" value="ad_below_title_2" <?php checked(in_array('ad_below_title_2', $positions)); ?>> Ad 2 (Below Ad 1)</label>
                <label><input type="checkbox" name="ad_position[]" value="ad_below_featured_1" <?php checked(in_array('ad_below_featured_1', $positions)); ?>> Ad 3 (Below Featured Image)</label>
                <label><input type="checkbox" name="ad_position[]" value="ad_below_featured_2" <?php checked(in_array('ad_below_featured_2', $positions)); ?>> Ad 4 (Below Ad 3)</label>
                <label><input type="checkbox" name="ad_position[]" value="ad_mid_1" <?php checked(in_array('ad_mid_1', $positions)); ?>> Ad 5 (Square Mid-Article 1)</label>
                <label><input type="checkbox" name="ad_position[]" value="ad_mid_2" <?php checked(in_array('ad_mid_2', $positions)); ?>> Ad 6 (Square Mid-Article 2)</label>
                <label><input type="checkbox" name="ad_position[]" value="ad_bottom_1" <?php checked(in_array('ad_bottom_1', $positions)); ?>> Ad 7 (Below Author Box)</label>
                <label><input type="checkbox" name="ad_position[]" value="ad_bottom_2" <?php checked(in_array('ad_bottom_2', $positions)); ?>> Ad 8 (Below Ad 7)</label>
            </div>
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
                <label>Upload Desktop Creative (Image or GIF)</label>
                <div style="display:flex; gap:10px;">
                    <input type="url" id="ad_image_url" name="ad_image_url" value="<?php echo esc_attr($image); ?>" placeholder="https://..." style="flex:1;" />
                    <button type="button" class="button" id="upload_image_button">Browse / Upload</button>
                </div>
                <img id="ad_image_preview" src="<?php echo esc_attr($image); ?>" style="max-width: 100%; max-height: 200px; margin-top: 15px; border-radius: 4px; border: 1px solid #ccc; display: <?php echo $image ? 'block' : 'none'; ?>;" />
            </div>
            <div class="neptech-form-group" style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                <label>Upload Mobile Creative (Optional Image or GIF for Phones)</label>
                <div style="display:flex; gap:10px;">
                    <input type="url" id="ad_mobile_image_url" name="ad_mobile_image_url" value="<?php echo esc_attr($image_mobile); ?>" placeholder="https://..." style="flex:1;" />
                    <button type="button" class="button" id="upload_mobile_image_button">Browse / Upload</button>
                </div>
                <img id="ad_mobile_image_preview" src="<?php echo esc_attr($image_mobile); ?>" style="max-width: 100%; max-height: 200px; margin-top: 15px; border-radius: 4px; border: 1px solid #ccc; display: <?php echo $image_mobile ? 'block' : 'none'; ?>;" />
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
    if ( isset( $_POST['ad_mobile_image_url'] ) ) update_post_meta( $post_id, '_ad_image_mobile', esc_url_raw($_POST['ad_mobile_image_url']) );
    if ( isset( $_POST['ad_code'] ) ) update_post_meta( $post_id, '_ad_code', $_POST['ad_code'] ); // allow html/js
    if ( isset( $_POST['ad_position'] ) && is_array($_POST['ad_position']) ) {
        $clean_positions = array_map('sanitize_text_field', $_POST['ad_position']);
        update_post_meta( $post_id, '_ad_position', $clean_positions );
    } else {
        delete_post_meta( $post_id, '_ad_position' );
    }
});

// 5. REST Endpoints
add_action( 'rest_api_init', function () {
    register_rest_route( 'neptech/v1', '/promos', [
        'methods' => 'GET',
        'callback' => 'neptech_get_ads_api',
        'permission_callback' => '__return_true'
    ]);

    register_rest_route( 'neptech/v1', '/promos/click/(?P<id>\d+)', [
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
        'image_mobile_url' => get_post_meta( $ad->ID, '_ad_image_mobile', true ),
        'code' => get_post_meta( $ad->ID, '_ad_code', true ),
        'click_url' => get_rest_url( null, 'neptech/v1/promos/click/' . $ad->ID )
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

// =========================================================================
// NepTechBrief - Ad Dimensions & Guidelines Dashboard Widget
// =========================================================================

add_action('add_meta_boxes', 'neptech_add_ad_guidelines_metabox');
function neptech_add_ad_guidelines_metabox() {
    add_meta_box(
        'neptech_ad_guidelines',
        '?? Ad Dimensions & Guidelines',
        'neptech_ad_guidelines_html',
        'neptech_ad',
        'normal',
        'high'
    );
}

function neptech_ad_guidelines_html($post) {
    ?>
    <style>
        .neptech-ad-guide { font-size: 13px; line-height: 1.5; color: #3c434a; }
        .neptech-ad-guide h4 { margin-top: 15px; margin-bottom: 5px; font-size: 14px; color: #1d2327; }
        .neptech-ad-guide code { background: #f0f0f1; padding: 2px 5px; border-radius: 3px; font-size: 12px; color: #d63638; }
        .neptech-ad-guide ul { margin-left: 20px; list-style-type: disc; margin-top: 5px; }
        .neptech-ad-guide .rules { background: #fff8e5; padding: 10px; border-left: 4px solid #f0b849; margin-top: 15px; }
    </style>
    
    <div class="neptech-ad-guide">
        <p><strong>Attention Designers:</strong> Please follow these exact dimensions to prevent layout shifts on the Next.js frontend and ensure maximum page speed.</p>
        
        <h4>1. Top & Bottom Leaderboards (<code>top</code>, <code>bottom</code>, <code>between_sections</code>)</h4>
        <ul>
            <li><strong>Recommended Size:</strong> <code>1200px</code> width × <code>130px</code> height.</li>
            <li><strong>Constraint:</strong> Strictly max-height <code>130px</code>. Keep text centered for mobile cropping.</li>
        </ul>

        <h4>2. Sidebar Ads (<code>sidebar</code>)</h4>
        <ul>
            <li><strong>Recommended Size:</strong> <code>300px</code> width × <code>250px</code> height OR <code>300px</code> width × <code>600px</code> height.</li>
            <li><strong>Constraint:</strong> Only appears on single article pages (right column).</li>
        </ul>

        <h4>3. Middle of Article (<code>article_mid</code>)</h4>
        <ul>
            <li><strong>Recommended Size:</strong> <code>800px</code> width × <code>130px</code> height.</li>
            <li><strong>Constraint:</strong> Max height <code>130px</code> to avoid disrupting the reader's flow.</li>
        </ul>

        <div class="rules">
            <h4>?? Optimization Rules</h4>
            <ul>
                <li>Use <strong>WebP</strong> or <strong>JPG</strong> (Avoid PNGs).</li>
                <li>Keep file sizes strictly <strong>under 150KB</strong>.</li>
                <li>Images use <code>object-cover</code> frontend styling. Avoid putting tiny text on the extreme left/right edges as it scales dynamically on phones.</li>
            </ul>
        </div>
    </div>
    <?php
}



