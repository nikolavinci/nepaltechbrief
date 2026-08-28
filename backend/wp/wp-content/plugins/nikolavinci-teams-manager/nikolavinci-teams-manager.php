<?php
/**
 * Plugin Name: NikolaVinci Teams Manager
 * Description: Manages the editorial team members and exposes them to the Next.js frontend via REST API.
 * Version: 1.0.0
 * Author: Aanshhuu
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Register CPT
add_action( 'init', function() {
    register_post_type( 'team_member', [
        'labels' => [
            'name' => 'Team Members',
            'singular_name' => 'Team Member',
            'add_new' => 'Add New Member',
            'edit_item' => 'Edit Member'
        ],
        'public' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-groups',
        'supports' => ['title', 'editor', 'thumbnail', 'page-attributes'], // page-attributes for order
    ]);
});

// 2. Add Meta Boxes for Roles and Social
add_action('add_meta_boxes', function() {
    add_meta_box('team_member_meta', 'Member Details', 'team_member_meta_html', 'team_member', 'normal', 'high');
});

function team_member_meta_html($post) {
    $role_en = get_post_meta($post->ID, 'role_en', true);
    $role_np = get_post_meta($post->ID, 'role_np', true);
    $facebook = get_post_meta($post->ID, 'facebook', true);
    $twitter = get_post_meta($post->ID, 'twitter', true);
    $linkedin = get_post_meta($post->ID, 'linkedin', true);
    ?>
    <p>
        <label><b>Role (English):</b></label><br>
        <input type="text" name="role_en" value="<?php echo esc_attr($role_en); ?>" style="width:100%;">
    </p>
    <p>
        <label><b>Role (Nepali):</b></label><br>
        <input type="text" name="role_np" value="<?php echo esc_attr($role_np); ?>" style="width:100%;">
    </p>
    <p>
        <label><b>Facebook URL:</b></label><br>
        <input type="url" name="facebook" value="<?php echo esc_attr($facebook); ?>" style="width:100%;" placeholder="https://facebook.com/...">
    </p>
    <p>
        <label><b>Twitter / X URL:</b></label><br>
        <input type="url" name="twitter" value="<?php echo esc_attr($twitter); ?>" style="width:100%;" placeholder="https://twitter.com/...">
    </p>
    <p>
        <label><b>LinkedIn URL:</b></label><br>
        <input type="url" name="linkedin" value="<?php echo esc_attr($linkedin); ?>" style="width:100%;" placeholder="https://linkedin.com/...">
    </p>
    <p><em>Note: Add the profile picture using the standard "Featured Image" box on the right. You can control the order they appear by changing the "Order" number in Page Attributes.</em></p>
    <?php
}

// 3. Save Meta
add_action('save_post', function($post_id) {
    if (array_key_exists('role_en', $_POST)) update_post_meta($post_id, 'role_en', sanitize_text_field($_POST['role_en']));
    if (array_key_exists('role_np', $_POST)) update_post_meta($post_id, 'role_np', sanitize_text_field($_POST['role_np']));
    if (array_key_exists('facebook', $_POST)) update_post_meta($post_id, 'facebook', esc_url_raw($_POST['facebook']));
    if (array_key_exists('twitter', $_POST)) update_post_meta($post_id, 'twitter', esc_url_raw($_POST['twitter']));
    if (array_key_exists('linkedin', $_POST)) update_post_meta($post_id, 'linkedin', esc_url_raw($_POST['linkedin']));
});

// 4. Expose Meta and Thumbnail to REST API
add_action('rest_api_init', function() {
    register_rest_field('team_member', 'member_details', [
        'get_callback' => function($post_arr) {
            $post_id = $post_arr['id'];
            $image_url = get_the_post_thumbnail_url($post_id, 'full');
            return [
                'role_en' => get_post_meta($post_id, 'role_en', true),
                'role_np' => get_post_meta($post_id, 'role_np', true),
                'facebook' => get_post_meta($post_id, 'facebook', true),
                'twitter' => get_post_meta($post_id, 'twitter', true),
                'linkedin' => get_post_meta($post_id, 'linkedin', true),
                'image_url' => $image_url ?: null
            ];
        }
    ]);
});

