<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_Admin {
    public function __construct() {
        add_action('admin_menu', [ $this, 'add_menu' ]);
    }

    public function add_menu() {
        add_menu_page('AI Content Automaton', 'AI Automaton', 'publish_posts', 'content-automaton', [ $this, 'render_dashboard' ], 'dashicons-superhero', 6);
    }

    public function render_dashboard() {
        $tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'dashboard';
        
        if (isset($_POST['ca_save_api_settings'])) {
            update_option('ca_engine_status', sanitize_text_field($_POST['ca_engine_status']));
            update_option('ca_cron_num', intval($_POST['ca_cron_num']));
            update_option('ca_cron_unit', sanitize_text_field($_POST['ca_cron_unit']));
            
            update_option('ca_ai_provider', sanitize_text_field($_POST['ca_ai_provider']));
            update_option('ca_openai_key', sanitize_text_field($_POST['ca_openai_key']));
            update_option('ca_gemini_key', sanitize_text_field($_POST['ca_gemini_key']));
            
            update_option('ca_unsplash_key', sanitize_text_field($_POST['ca_unsplash_key']));
            update_option('ca_pexels_key', sanitize_text_field($_POST['ca_pexels_key']));
            update_option('ca_pixabay_key', sanitize_text_field($_POST['ca_pixabay_key']));
            
            update_option('ca_custom_prompt', stripslashes($_POST['ca_custom_prompt']));
            update_option('ca_lang_slug', sanitize_text_field($_POST['ca_lang_slug']));
            update_option('ca_lang_meta', sanitize_text_field($_POST['ca_lang_meta']));
            update_option('ca_lang_tags', sanitize_text_field($_POST['ca_lang_tags']));
            
            wp_clear_scheduled_hook('ca_process_discovery_queue');
            wp_clear_scheduled_hook('ca_process_fetch_queue');
            wp_clear_scheduled_hook('ca_process_generation_queue');
            
            if ($_POST['ca_engine_status'] == 'running') {
                wp_schedule_event(time(), 'ca_custom_interval', 'ca_process_discovery_queue');
                wp_schedule_event(time(), 'ca_custom_interval', 'ca_process_fetch_queue');
                wp_schedule_event(time(), 'ca_custom_interval', 'ca_process_generation_queue');
            }
            
            echo '<div class="notice notice-success"><p>Settings Saved & Engine Updated!</p></div>';
        }
        
        if (isset($_POST['ca_add_source'])) {
            global $wpdb;
            $wpdb->insert($wpdb->prefix . 'ca_sources', [
                'name' => sanitize_text_field($_POST['source_name']),
                'url' => esc_url_raw($_POST['source_url']),
                'type' => 'rss',
                'default_category' => intval($_POST['source_category']),
                'auto_publish' => isset($_POST['auto_publish']) ? 1 : 0
            ]);
            echo '<div class="notice notice-success"><p>New Source Added Successfully!</p></div>';
        }
        
        if (isset($_GET['delete_source'])) {
            global $wpdb;
            $wpdb->delete($wpdb->prefix . 'ca_sources', ['id' => intval($_GET['delete_source'])]);
            echo '<div class="notice notice-success"><p>Source Deleted.</p></div>';
        }

        echo '<div class="wrap">';
        echo '<h1 style="margin-bottom:20px; font-weight:800; color:#2563eb;">AI Content Automaton</h1>';
        echo '<h2 class="nav-tab-wrapper" style="border-bottom: 2px solid #e5e7eb;">';
        echo '<a href="?page=content-automaton&tab=dashboard" class="nav-tab ' . ($tab == 'dashboard' ? 'nav-tab-active' : '') . '">Overview & Manual Run</a>';
        echo '<a href="?page=content-automaton&tab=sources" class="nav-tab ' . ($tab == 'sources' ? 'nav-tab-active' : '') . '">News Sources</a>';
        echo '<a href="?page=content-automaton&tab=drafts" class="nav-tab ' . ($tab == 'drafts' ? 'nav-tab-active' : '') . '">Drafted Articles</a>';
        echo '<a href="?page=content-automaton&tab=logs" class="nav-tab ' . ($tab == 'logs' ? 'nav-tab-active' : '') . '">System Logs (Errors)</a>';
        echo '<a href="?page=content-automaton&tab=settings" class="nav-tab ' . ($tab == 'settings' ? 'nav-tab-active' : '') . '">Engine Settings</a>';
        echo '</h2>';
        
        echo '<div style="background:#fff; padding:30px; border:1px solid #e5e7eb; border-top:none; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">';
        
        if ($tab == 'dashboard') $this->render_overview();
        elseif ($tab == 'sources') $this->render_sources();
        elseif ($tab == 'drafts') $this->render_drafts();
        elseif ($tab == 'logs') $this->render_logs();
        elseif ($tab == 'settings') $this->render_settings();
        
        echo '</div></div>';
    }

    private function render_overview() {
        global $wpdb;
        $total_sources = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ca_sources");
        $pending_urls = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ca_urls WHERE status = 'pending'");
        $generated = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ca_urls WHERE status = 'draft_created'");
        $status = get_option('ca_engine_status', 'running');
        $color = $status == 'running' ? '#10b981' : '#ef4444';
        
        echo '<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:30px;">';
        $this->stat_card("Engine Status", strtoupper($status), $color);
        $this->stat_card("Active Sources", $total_sources ? $total_sources : 0, "#3b82f6");
        $this->stat_card("Articles in Queue", $pending_urls ? $pending_urls : 0, "#f59e0b");
        $this->stat_card("AI Articles Generated", $generated ? $generated : 0, "#8b5cf6");
        echo '</div>';
        
        echo '<h2>Manual Execution</h2>';
        echo '<div style="display:flex; gap:10px; margin-top:20px;">';
        echo '<button id="ca-btn-run" class="button button-primary button-large" style="background:#10b981; border-color:#059669;">▶ Force Run Queues Now</button>';
        echo '</div>';
        echo '<div id="ca-run-log" style="margin-top:15px; font-weight:bold; padding:15px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; display:none;"></div>';
        
        ?>
        <script>
        jQuery(document).ready(function($) {
            $('#ca-btn-run').click(function() {
                var log = $('#ca-run-log').show().html('<span style="color:#f59e0b;">Starting Queue Executions... (Check System Logs tab for errors if drafts do not appear)</span>');
                $.post(ajaxurl, {action: 'ca_manual_run'}, function(res) {
                    log.html('<span style="color:#10b981;">' + res.data + '</span>');
                }).fail(function() {
                    log.html('<span style="color:#ef4444;">Request timed out. The engine is running in the background!</span>');
                });
            });
        });
        </script>
        <?php
    }
    
    private function stat_card($title, $value, $color) {
        echo "<div style='background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid {$color}; padding:20px; border-radius:6px;'>";
        echo "<h3 style='margin:0 0 10px 0; color:#64748b; font-size:14px; text-transform:uppercase;'>{$title}</h3>";
        echo "<div style='font-size:24px; font-weight:800; color:#0f172a;'>{$value}</div>";
        echo "</div>";
    }

    private function render_sources() {
        global $wpdb;
        $sources = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ca_sources ORDER BY id DESC");
        
        echo '<h2>Manage News Sources</h2>';
        echo '<table class="wp-list-table widefat fixed striped" style="margin-bottom:40px;">';
        echo '<thead><tr><th>Source Name</th><th>RSS URL</th><th>Category</th><th>Auto-Publish</th><th>Action</th></tr></thead><tbody>';
        if (empty($sources)) {
            echo '<tr><td colspan="5">No sources added yet. Add one below!</td></tr>';
        } else {
            foreach($sources as $s) {
                $cat = get_the_category_by_ID($s->default_category);
                $auto = $s->auto_publish ? '<span style="color:green;font-weight:bold;">Yes</span>' : 'No (Draft)';
                echo "<tr>
                    <td><strong>" . esc_html($s->name) . "</strong></td>
                    <td><a href='" . esc_url($s->url) . "' target='_blank'>" . esc_html($s->url) . "</a></td>
                    <td>{$cat}</td>
                    <td>{$auto}</td>
                    <td><a href='?page=content-automaton&tab=sources&delete_source={$s->id}' style='color:red;' onclick='return confirm(\"Delete this source?\");'>Delete</a></td>
                </tr>";
            }
        }
        echo '</tbody></table>';
        
        echo '<div style="background:#f8fafc; padding:20px; border:1px solid #e2e8f0; border-radius:6px; max-width:600px;">';
        echo '<h3 style="margin-top:0;">Add New RSS Source</h3>';
        echo '<form method="post">';
        echo '<p><label style="font-weight:bold;">Publisher Name:</label><br><input type="text" name="source_name" required style="width:100%;" placeholder="e.g. TechCrunch"></p>';
        echo '<p><label style="font-weight:bold;">RSS Feed URL:</label><br><input type="url" name="source_url" required style="width:100%;" placeholder="e.g. https://techcrunch.com/feed/"></p>';
        
        $categories = get_categories(['hide_empty' => 0]);
        echo '<p><label style="font-weight:bold;">Assign to Category:</label><br><select name="source_category" style="width:100%;">';
        foreach($categories as $cat) { echo "<option value='{$cat->term_id}'>{$cat->name}</option>"; }
        echo '</select></p>';
        
        echo '<p><label><input type="checkbox" name="auto_publish" value="1"> Automatically Publish (Skip Draft status)</label></p>';
        
        echo '<input type="hidden" name="ca_add_source" value="1">';
        echo '<p><button type="submit" class="button button-primary button-large">Add Source</button></p>';
        echo '</form></div>';
    }

    private function render_drafts() {
        global $wpdb;
        $drafts = $wpdb->get_results("SELECT post_id, url, discovered_at FROM {$wpdb->prefix}ca_urls WHERE status = 'draft_created' ORDER BY id DESC LIMIT 50");
        
        echo '<h2>AI Generated Drafts</h2>';
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>WordPress Draft</th><th>Original Source URL</th><th>Discovered Date</th></tr></thead><tbody>';
        
        if (empty($drafts)) {
            echo '<tr><td colspan="3">No drafts generated yet. Run the queue from the overview tab to generate articles.</td></tr>';
        } else {
            foreach($drafts as $d) {
                if ($d->post_id) {
                    $edit_url = get_edit_post_link($d->post_id);
                    $title = get_the_title($d->post_id);
                    echo "<tr>
                        <td><strong><a href='{$edit_url}'>" . esc_html($title ? $title : '(No Title)') . "</a></strong><br><a href='{$edit_url}'>Edit</a></td>
                        <td><a href='" . esc_url($d->url) . "' target='_blank'>" . esc_html($d->url) . "</a></td>
                        <td>" . esc_html($d->discovered_at) . "</td>
                    </tr>";
                }
            }
        }
        echo '</tbody></table>';
    }
    
    private function render_logs() {
        global $wpdb;
        $logs = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ca_logs ORDER BY id DESC LIMIT 100");
        
        echo '<h2>System & Error Logs</h2>';
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>Time</th><th>Level</th><th>Action</th><th>Message</th></tr></thead><tbody>';
        
        if (empty($logs)) {
            echo '<tr><td colspan="4">No logs generated yet.</td></tr>';
        } else {
            foreach($logs as $l) {
                $color = '';
                if ($l->level == 'ERROR') $color = 'color:red; font-weight:bold;';
                if ($l->level == 'SUCCESS') $color = 'color:green; font-weight:bold;';
                
                echo "<tr>
                    <td>" . esc_html($l->time) . "</td>
                    <td style='{$color}'>" . esc_html($l->level) . "</td>
                    <td>" . esc_html(strtoupper($l->action)) . "</td>
                    <td>" . esc_html($l->message) . "</td>
                </tr>";
            }
        }
        echo '</tbody></table>';
    }

    private function render_settings() {
        echo '<h2>Engine Configuration</h2>';
        echo '<form method="post" style="max-width:800px;">';
        
        // 1. Core Scheduling
        echo '<h3 style="border-bottom:1px solid #ccc; padding-bottom:10px; margin-top:30px;">1. Execution & Scheduling</h3>';
        echo '<table class="form-table">';
        $status = get_option('ca_engine_status', 'running');
        echo '<tr><th><label style="font-weight:bold;">Engine Status</label></th><td>';
        echo '<select name="ca_engine_status" style="width:100%;"><option value="running" ' . selected($status, 'running', false) . '>Running (Cron Active)</option><option value="paused" ' . selected($status, 'paused', false) . '>Paused (Cron Disabled)</option></select></td></tr>';
        
        $cron_num = get_option('ca_cron_num', '1');
        $cron_unit = get_option('ca_cron_unit', 'hours');
        echo '<tr><th><label style="font-weight:bold;">Cron Schedule</label></th><td>';
        echo 'Run every <input type="number" name="ca_cron_num" value="' . esc_attr($cron_num) . '" min="1" style="width:80px;"> ';
        echo '<select name="ca_cron_unit"><option value="minutes" ' . selected($cron_unit, 'minutes', false) . '>Minutes</option><option value="hours" ' . selected($cron_unit, 'hours', false) . '>Hours</option><option value="days" ' . selected($cron_unit, 'days', false) . '>Days</option></select></td></tr>';
        echo '</table>';
        
        // 2. Custom Prompts and Language SEO
        echo '<h3 style="border-bottom:1px solid #ccc; padding-bottom:10px; margin-top:30px;">2. AI Prompt & SEO Languages</h3>';
        echo '<table class="form-table">';
        
        $default_prompt = "Reword this article including the title and write it in Nepali to avoid plagiarism and suggest prompt for AI image generation, slug, tags, category (english) and nepali, meta description.";
        $prompt = get_option('ca_custom_prompt', $default_prompt);
        echo '<tr><th><label style="font-weight:bold;">Custom System Prompt</label></th><td>';
        echo '<textarea name="ca_custom_prompt" rows="5" style="width:100%;">' . esc_textarea($prompt) . '</textarea>';
        echo '<p class="description">Provide instructions for how the AI should rewrite the article. (The system will automatically force the AI to return the output in JSON format based on this prompt).</p></td></tr>';
        
        $lang_slug = get_option('ca_lang_slug', 'english');
        echo '<tr><th><label style="font-weight:bold;">Slug Language</label></th><td>';
        echo '<select name="ca_lang_slug" style="width:100%;">';
        echo '<option value="english" ' . selected($lang_slug, 'english', false) . '>English (SEO Friendly)</option>';
        echo '<option value="nepali" ' . selected($lang_slug, 'nepali', false) . '>Nepali (Unicode)</option>';
        echo '<option value="romanized" ' . selected($lang_slug, 'romanized', false) . '>Romanized Nepali</option>';
        echo '</select></td></tr>';
        
        $lang_meta = get_option('ca_lang_meta', 'english');
        echo '<tr><th><label style="font-weight:bold;">Meta Description Language</label></th><td>';
        echo '<select name="ca_lang_meta" style="width:100%;">';
        echo '<option value="english" ' . selected($lang_meta, 'english', false) . '>English</option>';
        echo '<option value="nepali" ' . selected($lang_meta, 'nepali', false) . '>Nepali</option>';
        echo '</select></td></tr>';
        
        $lang_tags = get_option('ca_lang_tags', 'bilingual');
        echo '<tr><th><label style="font-weight:bold;">Tags & Keywords Language</label></th><td>';
        echo '<select name="ca_lang_tags" style="width:100%;">';
        echo '<option value="english" ' . selected($lang_tags, 'english', false) . '>English</option>';
        echo '<option value="nepali" ' . selected($lang_tags, 'nepali', false) . '>Nepali</option>';
        echo '<option value="bilingual" ' . selected($lang_tags, 'bilingual', false) . '>Bilingual (Both)</option>';
        echo '</select></td></tr>';
        
        echo '</table>';

        // 3. API Keys
        echo '<h3 style="border-bottom:1px solid #ccc; padding-bottom:10px; margin-top:30px;">3. Provider API Keys</h3>';
        echo '<table class="form-table">';
        
        $provider = get_option('ca_ai_provider', 'openai');
        echo '<tr><th><label style="font-weight:bold;">Active AI Provider</label></th><td>';
        echo '<select name="ca_ai_provider" style="width:100%;"><option value="openai" ' . selected($provider, 'openai', false) . '>OpenAI (GPT-4o-mini)</option><option value="gemini" ' . selected($provider, 'gemini', false) . '>Google Gemini (1.5 Flash)</option></select></td></tr>';
        
        echo '<tr><th><label style="font-weight:bold;">OpenAI API Key</label></th><td>';
        echo '<input type="password" name="ca_openai_key" value="' . esc_attr(get_option('ca_openai_key')) . '" style="width:100%;"><p class="description"><a href="https://platform.openai.com/api-keys" target="_blank">Get OpenAI API Key</a></p></td></tr>';
        
        echo '<tr><th><label style="font-weight:bold;">Google Gemini API Key</label></th><td>';
        echo '<input type="password" name="ca_gemini_key" value="' . esc_attr(get_option('ca_gemini_key')) . '" style="width:100%;"><p class="description"><a href="https://aistudio.google.com/app/apikey" target="_blank">Get Google Gemini API Key</a></p></td></tr>';
        
        echo '<tr><th><label style="font-weight:bold;">Unsplash API Key</label></th><td>';
        echo '<input type="password" name="ca_unsplash_key" value="' . esc_attr(get_option('ca_unsplash_key')) . '" style="width:100%;"><p class="description"><a href="https://unsplash.com/developers" target="_blank">Get Unsplash API Key</a></p></td></tr>';
        
        echo '<tr><th><label style="font-weight:bold;">Pexels API Key</label></th><td>';
        echo '<input type="password" name="ca_pexels_key" value="' . esc_attr(get_option('ca_pexels_key')) . '" style="width:100%;"><p class="description"><a href="https://www.pexels.com/api/" target="_blank">Get Pexels API Key</a></p></td></tr>';
        
        echo '<tr><th><label style="font-weight:bold;">Pixabay API Key</label></th><td>';
        echo '<input type="password" name="ca_pixabay_key" value="' . esc_attr(get_option('ca_pixabay_key')) . '" style="width:100%;"><p class="description"><a href="https://pixabay.com/api/docs/" target="_blank">Get Pixabay API Key</a></p></td></tr>';
        
        echo '</table>';
        
        echo '<input type="hidden" name="ca_save_api_settings" value="1">';
        echo '<p style="margin-top:20px;"><button type="submit" class="button button-primary button-large">Save Settings & Restart Engine</button></p>';
        echo '</form>';
    }
}