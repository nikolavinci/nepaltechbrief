<?php
/*
Plugin Name: NepTechBrief Teams & Entity Manager
Description: Advanced Entity Home & Teams Manager. Creates dedicated Person entities with comprehensive Schema.org JSON-LD support for AEO, GEO, and AI search optimization.
Version: 3.0.0
Author: NikolaVinci
*/

if (!defined('ABSPATH')) exit;

class NepTech_Entity_Manager {

    public function __construct() {
        add_action('init', [$this, 'register_cpt']);
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);
        add_action('save_post', [$this, 'save_meta_boxes']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
        
        // Disable Gutenberg for this CPT to enforce structured data entry
        add_filter('use_block_editor_for_post_type', function($use, $post_type) {
            if ('neptech_team_member' === $post_type) return false;
            return $use;
        }, 10, 2);
    }

    public function register_cpt() {
        register_post_type('neptech_team_member', [
            'labels' => [
                'name' => 'Team Entities',
                'singular_name' => 'Team Member',
                'add_new_item' => 'Add New Team Member',
                'edit_item' => 'Edit Team Member',
            ],
            'public' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'thumbnail'],
            'menu_icon' => 'dashicons-groups',
            'has_archive' => false,
            'rewrite' => ['slug' => 'team'],
        ]);
    }

    public function enqueue_admin_assets($hook) {
        global $post_type;
        if ('neptech_team_member' === $post_type) {
            wp_enqueue_media();
            // We will inline the JS/CSS for simplicity and robustness
        }
    }

    public function add_meta_boxes() {
        add_meta_box('neptech_entity_data', 'Person Entity Data', [$this, 'render_meta_box'], 'neptech_team_member', 'normal', 'high');
        add_meta_box('neptech_entity_score', 'Entity Completeness Score', [$this, 'render_score_box'], 'neptech_team_member', 'side', 'high');
    }

    public function render_score_box($post) {
        // We will calculate this dynamically in JS based on filled fields, but provide a basic container
        echo '<div id="entity-completeness-gauge" style="text-align:center; padding:10px;">
                <div style="font-size:32px; font-weight:bold; color:#10b981;" id="score-number">0%</div>
                <div style="font-size:12px; color:#64748b;">Entity Completeness</div>
                <hr style="margin:10px 0;">
                <ul style="text-align:left; font-size:11px; margin:0; padding-left:15px;" id="score-breakdown">
                </ul>
              </div>';
    }

    public function render_meta_box($post) {
        wp_nonce_field('neptech_entity_save', 'neptech_entity_nonce');
        
        // Fetch all granular meta
        $m = get_post_meta($post->ID);
        $get = function($k) use ($m) { return isset($m[$k][0]) ? $m[$k][0] : ''; };
        
        // Decode JSON arrays
        $same_as = json_decode($get('_entity_same_as'), true) ?: [];
        $education = json_decode($get('_entity_education'), true) ?: [];
        $awards = json_decode($get('_entity_awards'), true) ?: [];
        
        ?>
        <style>
            .entity-tabs { display: flex; border-bottom: 1px solid #ccc; margin-bottom: 20px; background: #f8fafc; }
            .entity-tab { padding: 10px 20px; cursor: pointer; border: 1px solid transparent; border-bottom: none; font-weight: 600; color: #64748b; }
            .entity-tab.active { background: #fff; border-color: #ccc; color: #0f172a; margin-bottom: -1px; }
            .entity-panel { display: none; padding: 10px; }
            .entity-panel.active { display: block; }
            .nv-form-group { margin-bottom: 15px; }
            .nv-form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
            .nv-form-group input[type="text"], .nv-form-group input[type="url"], .nv-form-group select, .nv-form-group textarea { width: 100%; max-width: 600px; }
            .repeater-row { background: #f1f5f9; padding: 15px; margin-bottom: 10px; border: 1px solid #e2e8f0; position: relative; }
            .remove-row { position: absolute; top: 10px; right: 10px; color: #ef4444; cursor: pointer; text-decoration: none; font-weight:bold; }
        </style>

        <div class="entity-tabs">
            <div class="entity-tab active" data-target="tab-identity">Identity & Bio</div>
            <div class="entity-tab" data-target="tab-professional">Professional</div>
            <div class="entity-tab" data-target="tab-external">External Profiles (sameAs)</div>
            <div class="entity-tab" data-target="tab-education">Education & Awards</div>
        </div>

        <div id="tab-identity" class="entity-panel active">
            <div class="nv-form-group">
                <label>First Name (Given Name)</label>
                <input type="text" name="first_name" value="<?php echo esc_attr($get('_entity_first_name')); ?>">
            </div>
            <div class="nv-form-group">
                <label>Last Name (Family Name)</label>
                <input type="text" name="last_name" value="<?php echo esc_attr($get('_entity_last_name')); ?>">
            </div>
            <div class="nv-form-group">
                <label>Profile Picture URL</label>
                <div style="display:flex; gap:10px;">
                    <input type="url" name="profile_picture" id="profile_picture" value="<?php echo esc_attr($get('_entity_profile_picture')); ?>" style="flex:1;">
                    <button type="button" class="button nv-media-btn" data-target="#profile_picture">Choose Image</button>
                </div>
            </div>
            <div class="nv-form-group">
                <label>Short Bio (Search Summary)</label>
                <textarea name="short_bio" rows="3"><?php echo esc_textarea($get('_entity_short_bio')); ?></textarea>
                <p class="description">A concise 1-2 sentence description used for lists and SEO meta descriptions.</p>
            </div>
            <div class="nv-form-group">
                <label>Full Biography</label>
                <?php wp_editor($get('_entity_full_bio'), 'full_bio', ['textarea_rows'=>10, 'media_buttons'=>false]); ?>
                <p class="description">Detailed biography for the entity home page.</p>
            </div>
        </div>

        <div id="tab-professional" class="entity-panel">
            <div class="nv-form-group">
                <label>Designation / Job Title</label>
                <select name="designation">
                    <option value="">-- Select --</option>
                    <?php 
                    $roles = ['Founder','CEO','Founder and CEO','CFO','CMO','Director','Journalist','Photojournalist','Editor','Editor in Chief','Social Media Manager','Author','Writer','Videographer'];
                    foreach($roles as $r) echo '<option value="'.$r.'" '.selected($get('_entity_designation'), $r, false).'>'.$r.'</option>';
                    ?>
                </select>
            </div>
            <div class="nv-form-group">
                <label>Areas of Expertise (Comma separated)</label>
                <input type="text" name="expertise" value="<?php echo esc_attr($get('_entity_expertise')); ?>" placeholder="e.g., Artificial Intelligence, Mobile Hardware, SEO">
            </div>
            <div class="nv-form-group">
                <label>Current Organization</label>
                <input type="text" name="organization" value="<?php echo esc_attr($get('_entity_organization') ?: 'NepTechBrief'); ?>" readonly>
                <p class="description">Default is set to the publication. This connects the worksFor Schema.</p>
            </div>
        </div>

        <div id="tab-external" class="entity-panel">
            <p class="description">Add verified external profiles to populate the Schema.org <code>sameAs</code> array. Essential for Entity Disambiguation (Knowledge Graph).</p>
            <div id="sameas-container">
                <?php foreach($same_as as $i => $sa): ?>
                <div class="repeater-row">
                    <a href="#" class="remove-row">X Remove</a>
                    <div style="display:flex; gap:10px;">
                        <select name="same_as_platform[]">
                            <?php foreach(['LinkedIn','Twitter/X','Facebook','Instagram','Wikipedia','Wikidata','Personal Website','Other'] as $p) echo '<option value="'.$p.'" '.selected($sa['platform'], $p, false).'>'.$p.'</option>'; ?>
                        </select>
                        <input type="url" name="same_as_url[]" value="<?php echo esc_attr($sa['url']); ?>" placeholder="https://" style="flex:1;">
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button" id="add-sameas">+ Add Profile</button>
        </div>

        <div id="tab-education" class="entity-panel">
            <h3>Education (alumniOf)</h3>
            <div id="education-container">
                <?php foreach($education as $i => $ed): ?>
                <div class="repeater-row">
                    <a href="#" class="remove-row">X Remove</a>
                    <input type="text" name="edu_institution[]" value="<?php echo esc_attr($ed['institution']); ?>" placeholder="Institution Name (e.g. Tribhuvan University)" style="margin-bottom:5px; width:100%;"><br>
                    <input type="text" name="edu_degree[]" value="<?php echo esc_attr($ed['degree']); ?>" placeholder="Degree (e.g. BSc Computer Science)" style="width:100%;">
                </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button" id="add-education">+ Add Education</button>

            <h3 style="margin-top:30px;">Awards</h3>
            <div id="awards-container">
                <?php foreach($awards as $i => $aw): ?>
                <div class="repeater-row">
                    <a href="#" class="remove-row">X Remove</a>
                    <input type="text" name="award_name[]" value="<?php echo esc_attr($aw['name']); ?>" placeholder="Award Name" style="margin-bottom:5px; width:100%;"><br>
                    <input type="text" name="award_org[]" value="<?php echo esc_attr($aw['org']); ?>" placeholder="Awarding Organization" style="width:100%;">
                </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button" id="add-award">+ Add Award</button>
        </div>

        <script>
        jQuery(document).ready(function($){
            // Tabs
            $('.entity-tab').click(function(){
                $('.entity-tab').removeClass('active');
                $('.entity-panel').removeClass('active');
                $(this).addClass('active');
                $('#' + $(this).data('target')).addClass('active');
            });
            
            // Media
            var mediaUploader;
            $(".nv-media-btn").click(function(e) {
                e.preventDefault();
                var target = $(this).data("target");
                if (mediaUploader) { mediaUploader.open(); return; }
                mediaUploader = wp.media({ title: "Choose Image", multiple: false });
                mediaUploader.on("select", function() {
                    var attachment = mediaUploader.state().get("selection").first().toJSON();
                    $(target).val(attachment.url);
                });
                mediaUploader.open();
            });

            // Repeaters
            $(document).on('click', '.remove-row', function(e){
                e.preventDefault();
                $(this).closest('.repeater-row').remove();
                calcScore();
            });

            $('#add-sameas').click(function(){
                $('#sameas-container').append('<div class="repeater-row"><a href="#" class="remove-row">X Remove</a><div style="display:flex; gap:10px;"><select name="same_as_platform[]"><option value="LinkedIn">LinkedIn</option><option value="Twitter/X">Twitter/X</option><option value="Wikipedia">Wikipedia</option><option value="Personal Website">Personal Website</option></select><input type="url" name="same_as_url[]" placeholder="https://" style="flex:1;"></div></div>');
            });

            $('#add-education').click(function(){
                $('#education-container').append('<div class="repeater-row"><a href="#" class="remove-row">X Remove</a><input type="text" name="edu_institution[]" placeholder="Institution Name" style="margin-bottom:5px; width:100%;"><br><input type="text" name="edu_degree[]" placeholder="Degree" style="width:100%;"></div>');
            });

            $('#add-award').click(function(){
                $('#awards-container').append('<div class="repeater-row"><a href="#" class="remove-row">X Remove</a><input type="text" name="award_name[]" placeholder="Award Name" style="margin-bottom:5px; width:100%;"><br><input type="text" name="award_org[]" placeholder="Awarding Organization" style="width:100%;"></div>');
            });

            // Score Logic
            function calcScore() {
                var score = 0;
                var max = 7;
                var b = "";
                
                if($('input[name="first_name"]').val()) { score++; b+="<li>✅ Identity</li>"; } else { b+="<li>❌ Identity</li>"; }
                if($('#profile_picture').val()) { score++; b+="<li>✅ Picture</li>"; } else { b+="<li>❌ Picture</li>"; }
                if($('textarea[name="short_bio"]').val()) { score++; b+="<li>✅ Bio</li>"; } else { b+="<li>❌ Bio</li>"; }
                if($('select[name="designation"]').val()) { score++; b+="<li>✅ Role</li>"; } else { b+="<li>❌ Role</li>"; }
                if($('input[name="expertise"]').val()) { score++; b+="<li>✅ Expertise</li>"; } else { b+="<li>❌ Expertise</li>"; }
                if($('#sameas-container .repeater-row').length > 0) { score++; b+="<li>✅ sameAs Links</li>"; } else { b+="<li>❌ sameAs Links</li>"; }
                if($('#education-container .repeater-row').length > 0) { score++; b+="<li>✅ Education</li>"; } else { b+="<li>❌ Education</li>"; }

                var pct = Math.round((score/max)*100);
                $('#score-number').text(pct + '%');
                $('#score-breakdown').html(b);
            }
            $('input, select, textarea').on('change keyup', calcScore);
            calcScore();
        });
        </script>
        <?php
    }

    public function save_meta_boxes($post_id) {
        if (!isset($_POST['neptech_entity_nonce']) || !wp_verify_nonce($_POST['neptech_entity_nonce'], 'neptech_entity_save')) return;
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        
        $fields = ['first_name', 'last_name', 'profile_picture', 'short_bio', 'full_bio', 'designation', 'expertise', 'organization'];
        foreach($fields as $f) {
            if(isset($_POST[$f])) update_post_meta($post_id, '_entity_'.$f, wp_kses_post($_POST[$f]));
        }

        // Save Repeaters as JSON
        $same_as = [];
        if(isset($_POST['same_as_platform']) && is_array($_POST['same_as_platform'])) {
            foreach($_POST['same_as_platform'] as $i => $plat) {
                if(!empty($_POST['same_as_url'][$i])) {
                    $same_as[] = ['platform' => sanitize_text_field($plat), 'url' => esc_url_raw($_POST['same_as_url'][$i])];
                }
            }
        }
        update_post_meta($post_id, '_entity_same_as', wp_slash(json_encode($same_as)));

        $education = [];
        if(isset($_POST['edu_institution']) && is_array($_POST['edu_institution'])) {
            foreach($_POST['edu_institution'] as $i => $inst) {
                if(!empty($inst)) {
                    $education[] = ['institution' => sanitize_text_field($inst), 'degree' => sanitize_text_field($_POST['edu_degree'][$i])];
                }
            }
        }
        update_post_meta($post_id, '_entity_education', wp_slash(json_encode($education)));

        $awards = [];
        if(isset($_POST['award_name']) && is_array($_POST['award_name'])) {
            foreach($_POST['award_name'] as $i => $aw) {
                if(!empty($aw)) {
                    $awards[] = ['name' => sanitize_text_field($aw), 'org' => sanitize_text_field($_POST['award_org'][$i])];
                }
            }
        }
        update_post_meta($post_id, '_entity_awards', wp_slash(json_encode($awards)));
        
        // Ensure Canonical ID is set based on slug (Immutable preferably, but we tie it to slug for now)
        $post = get_post($post_id);
        $canonical_id = "https://neptechbrief.com/team/" . $post->post_name . "/#person";
        update_post_meta($post_id, '_entity_canonical_id', $canonical_id);
    }

    public function register_rest_routes() {
        register_rest_route('neptech/v1', '/team', [
            'methods' => 'GET',
            'callback' => [$this, 'get_team_members'],
            'permission_callback' => '__return_true'
        ]);
        
        // Single entity route
        register_rest_route('neptech/v1', '/team/(?P<slug>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_single_team_member'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function get_team_members($request) {
        $args = ['post_type' => 'neptech_team_member', 'posts_per_page' => -1, 'post_status' => 'publish'];
        $posts = get_posts($args);
        $data = [];
        foreach($posts as $p) {
            $data[] = $this->format_entity($p);
        }
        return rest_ensure_response($data);
    }
    
    public function get_single_team_member($request) {
        $slug = $request->get_param('slug');
        $args = ['post_type' => 'neptech_team_member', 'name' => $slug, 'posts_per_page' => 1, 'post_status' => 'publish'];
        $posts = get_posts($args);
        if(empty($posts)) return new WP_Error('not_found', 'Entity not found', ['status' => 404]);
        
        return rest_ensure_response($this->format_entity($posts[0]));
    }
    
    private function format_entity($p) {
        $m = get_post_meta($p->ID);
        $get = function($k) use ($m) { return isset($m[$k][0]) ? $m[$k][0] : ''; };
        
        return [
            'id' => $p->ID,
            'slug' => $p->post_name,
            'canonical_id' => $get('_entity_canonical_id') ?: "https://neptechbrief.com/team/" . $p->post_name . "/#person",
            'first_name' => $get('_entity_first_name'),
            'last_name' => $get('_entity_last_name'),
            'designation' => $get('_entity_designation'),
            'expertise' => $get('_entity_expertise'),
            'organization' => $get('_entity_organization') ?: 'NepTechBrief',
            'profile_picture' => $get('_entity_profile_picture'),
            'short_bio' => $get('_entity_short_bio'),
            'full_bio' => $get('_entity_full_bio'),
            'same_as' => json_decode($get('_entity_same_as'), true) ?: [],
            'education' => json_decode($get('_entity_education'), true) ?: [],
            'awards' => json_decode($get('_entity_awards'), true) ?: [],
            
            // Legacy fallback for Next.js temporarily to prevent crash during migration
            'profile_details' => [
                'first_name' => $get('_entity_first_name'),
                'last_name' => $get('_entity_last_name'),
                'designation' => $get('_entity_designation'),
                'profile_picture' => $get('_entity_profile_picture'),
                'short_bio' => $get('_entity_short_bio')
            ]
        ];
    }
}

new NepTech_Entity_Manager();
