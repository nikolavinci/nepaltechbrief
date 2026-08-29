<?php
/**
 * Plugin Name: NikolaVinci Teams Manager
 * Description: Manages the editorial team members with a detailed profile UI and structured data support.
 * Version: 2.1.0
 * Author: NikolaVinci
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Register CPT (No editor, no thumbnail standard UI)
add_action( 'init', function() {
    register_post_type( 'team_member', [
        'labels' => [
            'name' => 'Team Members',
            'singular_name' => 'Team Member',
            'add_new' => 'Add New Member',
            'edit_item' => 'Edit Member Profile'
        ],
        'public' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-businessperson',
        'supports' => ['title', 'page-attributes'], // We handle everything else via custom meta box
    ]);
});

// 2. Enqueue Media Uploader scripts
add_action('admin_enqueue_scripts', function($hook) {
    global $post;
    if (($hook == 'post.php' || $hook == 'post-new.php') && $post->post_type == 'team_member') {
        wp_enqueue_media();
        wp_enqueue_script('nikolavinci-teams-media', plugin_dir_url(__FILE__) . 'admin.js', ['jquery'], '1.0', true);
    }
});

// 3. Add Custom Meta Box
add_action('add_meta_boxes', function() {
    add_meta_box('team_member_profile', 'Profile Details', 'team_member_meta_html', 'team_member', 'normal', 'high');
});

function team_member_meta_html($post) {
    $meta = get_post_meta($post->ID);
    
    $first_name = $meta['first_name'][0] ?? '';
    $last_name = $meta['last_name'][0] ?? '';
    $designation = $meta['designation'][0] ?? '';
    $email = $meta['email'][0] ?? '';
    $facebook = $meta['facebook'][0] ?? '';
    $twitter = $meta['twitter'][0] ?? '';
    $linkedin = $meta['linkedin'][0] ?? '';
    $short_bio = $meta['short_bio'][0] ?? '';
    $detailed_bio = $meta['detailed_bio'][0] ?? '';
    $profile_picture = $meta['profile_picture'][0] ?? '';
    $image_gallery = $meta['image_gallery'][0] ?? '';
    ?>
    <style>
        .nv-team-row { display: flex; gap: 20px; margin-bottom: 15px; }
        .nv-team-col { flex: 1; }
        .nv-team-col label { font-weight: bold; display: block; margin-bottom: 5px; }
        .nv-team-col input[type="text"], .nv-team-col input[type="email"], .nv-team-col input[type="url"], .nv-team-col textarea { width: 100%; }
        .nv-media-preview img { max-width: 150px; height: auto; display: block; margin-top: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    </style>
    
    <div class="nv-team-row">
        <div class="nv-team-col">
            <label>First Name</label>
            <input type="text" name="first_name" value="<?php echo esc_attr($first_name); ?>">
        </div>
        <div class="nv-team-col">
            <label>Last Name</label>
            <input type="text" name="last_name" value="<?php echo esc_attr($last_name); ?>">
        </div>
    </div>
    
    <div class="nv-team-row">
        <div class="nv-team-col">
            <label>Designation / Role</label>
            <input type="text" name="designation" value="<?php echo esc_attr($designation); ?>">
        </div>
        <div class="nv-team-col">
            <label>Email Address</label>
            <input type="email" name="email" value="<?php echo esc_attr($email); ?>">
        </div>
    </div>

    <div class="nv-team-row">
        <div class="nv-team-col">
            <label>Facebook</label><input type="url" name="facebook" value="<?php echo esc_attr($facebook); ?>">
        </div>
        <div class="nv-team-col">
            <label>Twitter / X</label><input type="url" name="twitter" value="<?php echo esc_attr($twitter); ?>">
        </div>
        <div class="nv-team-col">
            <label>LinkedIn</label><input type="url" name="linkedin" value="<?php echo esc_attr($linkedin); ?>">
        </div>
    </div>

    <div class="nv-team-row">
        <div class="nv-team-col">
            <label>Short Bio (Used for cards and SEO)</label>
            <textarea name="short_bio" rows="3"><?php echo esc_textarea($short_bio); ?></textarea>
        </div>
    </div>

    <div class="nv-team-row">
        <div class="nv-team-col">
            <label>Detailed Bio</label>
            <?php wp_editor($detailed_bio, 'detailed_bio', ['textarea_name' => 'detailed_bio', 'media_buttons' => false, 'textarea_rows' => 8]); ?>
        </div>
    </div>

    <div class="nv-team-row">
        <div class="nv-team-col nv-media-preview">
            <label>Profile Picture</label>
            <input type="hidden" name="profile_picture" id="profile_picture" value="<?php echo esc_attr($profile_picture); ?>">
            <button type="button" class="button nv-upload-btn" data-target="#profile_picture">Choose Image</button>
            <button type="button" class="button nv-remove-btn" data-target="#profile_picture">Remove</button>
            <div class="preview-area">
                <?php if ($profile_picture) echo '<img src="'.esc_url($profile_picture).'">'; ?>
            </div>
        </div>
        <div class="nv-team-col">
            <label>Image Gallery (Comma separated URLs)</label>
            <textarea name="image_gallery" rows="4"><?php echo esc_textarea($image_gallery); ?></textarea>
            <p class="description">Paste full image URLs here, separated by commas, for their personal gallery.</p>
        </div>
    </div>
    <?php
}

// 4. Save Meta
add_action('save_post', function($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    $fields = ['first_name', 'last_name', 'designation', 'email', 'facebook', 'twitter', 'linkedin', 'short_bio', 'detailed_bio', 'profile_picture', 'image_gallery'];
    foreach ($fields as $f) {
        if (isset($_POST[$f])) {
            $val = $_POST[$f];
            if (in_array($f, ['facebook', 'twitter', 'linkedin', 'profile_picture'])) $val = esc_url_raw($val);
            elseif ($f === 'detailed_bio') $val = wp_kses_post($val);
            else $val = sanitize_text_field($val);
            update_post_meta($post_id, $f, $val);
        }
    }
});

// 5. Expose Meta to REST API
add_action('rest_api_init', function() {
    register_rest_field('team_member', 'profile_details', [
        'get_callback' => function($post_arr) {
            $post_id = $post_arr['id'];
            $meta = get_post_meta($post_id);
            return [
                'first_name' => $meta['first_name'][0] ?? '',
                'last_name' => $meta['last_name'][0] ?? '',
                'designation' => $meta['designation'][0] ?? '',
                'email' => $meta['email'][0] ?? '',
                'facebook' => $meta['facebook'][0] ?? '',
                'twitter' => $meta['twitter'][0] ?? '',
                'linkedin' => $meta['linkedin'][0] ?? '',
                'short_bio' => $meta['short_bio'][0] ?? '',
                'detailed_bio' => $meta['detailed_bio'][0] ?? '',
                'profile_picture' => $meta['profile_picture'][0] ?? '',
                'image_gallery' => $meta['image_gallery'][0] ?? ''
            ];
        }
    ]);
});

