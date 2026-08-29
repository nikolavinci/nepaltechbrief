<?php
/**
 * Plugin Name: NikolaVinci Teams Manager
 * Description: Manages the editorial team members with a detailed profile UI and structured data support.
 * Version: 2.4.0
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
        <div class="nv-team-col nv-media-preview" style="flex: 0 0 150px; text-align:center;">
            <label style="display:block; margin-bottom:10px;">Profile Picture</label>
            <input type="hidden" name="profile_picture" id="profile_picture" value="<?php echo esc_attr($profile_picture); ?>">
            <div class="nv-upload-trigger" data-target="#profile_picture" style="cursor:pointer; width:120px; height:120px; border-radius:50%; border:2px dashed #cbd5e1; background:#f8fafc; margin:0 auto; overflow:hidden; position:relative; display:flex; align-items:center; justify-content:center;">
                <?php if ($profile_picture): ?>
                    <img src="<?php echo esc_url($profile_picture); ?>" style="width:100%; height:100%; object-fit:cover;">
                <?php else: ?>
                    <svg style="width:40px; height:40px; color:#94a3b8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                <?php endif; ?>
            </div>
            <a href="#" class="nv-remove-btn" data-target="#profile_picture" style="display:inline-block; margin-top:10px; color:#ef4444; text-decoration:none; font-size:12px;">Remove Image</a>
        </div>
        <div class="nv-team-col">
            <label>First Name</label>
            <input type="text" name="first_name" value="<?php echo esc_attr($first_name); ?>" style="margin-bottom:15px;">
            <label>Last Name</label>
            <input type="text" name="last_name" value="<?php echo esc_attr($last_name); ?>">
        </div>
    </div>
    
    <div class="nv-team-row">
        <div class="nv-team-col">
            <label>Designation / Role</label>
            <select name="designation" style="width:100%;">
                <option value="">-- Select Role --</option>
                <option value="Founder" <?php selected($designation, "Founder"); ?>>Founder</option><option value="CEO" <?php selected($designation, "CEO"); ?>>CEO</option><option value="Founder and CEO" <?php selected($designation, "Founder and CEO"); ?>>Founder and CEO</option><option value="CFO" <?php selected($designation, "CFO"); ?>>CFO</option><option value="CMO" <?php selected($designation, "CMO"); ?>>CMO</option><option value="Director" <?php selected($designation, "Director"); ?>>Director</option><option value="Journalist" <?php selected($designation, "Journalist"); ?>>Journalist</option><option value="Photojournalist" <?php selected($designation, "Photojournalist"); ?>>Photojournalist</option><option value="Editor" <?php selected($designation, "Editor"); ?>>Editor</option><option value="Editor in Chief" <?php selected($designation, "Editor in Chief"); ?>>Editor in Chief</option><option value="Social Media Manager" <?php selected($designation, "Social Media Manager"); ?>>Social Media Manager</option><option value="Author" <?php selected($designation, "Author"); ?>>Author</option><option value="Writer" <?php selected($designation, "Writer"); ?>>Writer</option><option value="Videographer" <?php selected($designation, "Videographer"); ?>>Videographer</option>
            </select>
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
        <div class="nv-team-col">
            <label style="display:block; margin-bottom:10px;">Image Gallery (Click box to manage)</label>
            <input type="hidden" name="image_gallery" id="image_gallery" value="<?php echo esc_attr($image_gallery); ?>">
            
            <div class="nv-gallery-trigger" data-target="#image_gallery" style="cursor:pointer; min-height:100px; border:2px dashed #cbd5e1; background:#f8fafc; border-radius:8px; padding:15px; display:flex; flex-wrap:wrap; align-items:center; gap:10px;">
                <?php 
                if ($image_gallery) {
                    $urls = explode(',', $image_gallery);
                    foreach($urls as $u) {
                        echo '<img src="'.esc_url($u).'" style="max-width:80px; height:80px; object-fit:cover; border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">';
                    }
                } else {
                    echo '<div style="width:100%; text-align:center; color:#94a3b8;"><svg style="width:30px; height:30px; margin:0 auto; display:block; margin-bottom:5px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>Click to add gallery images</div>';
                }
                ?>
            </div>
            <a href="#" class="nv-remove-gallery-btn" data-target="#image_gallery" style="display:inline-block; margin-top:10px; color:#ef4444; text-decoration:none; font-size:12px;">Clear Gallery</a>
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



