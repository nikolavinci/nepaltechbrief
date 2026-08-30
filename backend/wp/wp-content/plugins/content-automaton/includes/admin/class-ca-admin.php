<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_Admin {
    public function __construct() {
        add_action('admin_menu', [ $this, 'add_menu' ]);
    }

    public function add_menu() {
        add_menu_page(
            'AI Content Automaton',
            'AI Automaton',
            'publish_posts',
            'content-automaton',
            [ $this, 'render_dashboard' ],
            'dashicons-superhero',
            6
        );
    }

    public function render_dashboard() {
        $tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'dashboard';
        
        // Handle Settings Save
        if (isset($_POST['ca_save_api_settings'])) {
            update_option('ca_ai_provider', sanitize_text_field($_POST['ca_ai_provider']));
            update_option('ca_openai_key', sanitize_text_field($_POST['ca_openai_key']));
            update_option('ca_gemini_key', sanitize_text_field($_POST['ca_gemini_key']));
            echo '<div class="notice notice-success"><p>API Settings Saved!</p></div>';
        }
        
        // Handle Source Add
        if (isset($_POST['ca_add_source'])) {
            global $wpdb;
            $wpdb->insert(
                $wpdb->prefix . 'ca_sources',
                [
                    'name' => sanitize_text_field($_POST['source_name']),
                    'url' => esc_url_raw($_POST['source_url']),
                    'type' => 'rss',
                    'default_category' => intval($_POST['source_category']),
                    'auto_publish' => isset($_POST['auto_publish']) ? 1 : 0
                ]
            );
            echo '<div class="notice notice-success"><p>New Source Added Successfully!</p></div>';
        }
        
        // Handle Source Delete
        if (isset($_GET['delete_source'])) {
            global $wpdb;
            $wpdb->delete($wpdb->prefix . 'ca_sources', ['id' => intval($_GET['delete_source'])]);
            echo '<div class="notice notice-success"><p>Source Deleted.</p></div>';
        }

        echo '<div class="wrap">';
        echo '<h1 style="margin-bottom:20px; font-weight:800; color:#2563eb;">AI Content Automaton</h1>';
        echo '<h2 class="nav-tab-wrapper" style="border-bottom: 2px solid #e5e7eb;">';
        echo '<a href="?page=content-automaton&tab=dashboard" class="nav-tab ' . ($tab == 'dashboard' ? 'nav-tab-active' : '') . '">Overview</a>';
        echo '<a href="?page=content-automaton&tab=sources" class="nav-tab ' . ($tab == 'sources' ? 'nav-tab-active' : '') . '">News Sources</a>';
        echo '<a href="?page=content-automaton&tab=settings" class="nav-tab ' . ($tab == 'settings' ? 'nav-tab-active' : '') . '">AI Settings</a>';
        echo '</h2>';
        
        echo '<div style="background:#fff; padding:30px; border:1px solid #e5e7eb; border-top:none; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">';
        
        if ($tab == 'dashboard') {
            $this->render_overview();
        } elseif ($tab == 'sources') {
            $this->render_sources();
        } elseif ($tab == 'settings') {
            $this->render_settings();
        }
        
        echo '</div>';
        echo '</div>';
    }

    private function render_overview() {
        global $wpdb;
        $total_sources = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ca_sources");
        $pending_urls = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ca_urls WHERE status = 'pending'");
        $generated = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}ca_urls WHERE status = 'draft_created'");
        
        echo '<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:20px; margin-bottom:30px;">';
        $this->stat_card("Active Sources", $total_sources, "#3b82f6");
        $this->stat_card("Articles in Queue", $pending_urls, "#f59e0b");
        $this->stat_card("AI Articles Generated", $generated, "#10b981");
        echo '</div>';
        
        echo '<h2>How it works</h2>';
        echo '<p style="font-size:16px; color:#4b5563; max-width:800px; line-height:1.6;">This internal AI engine runs silently in the background. Once you add an RSS feed in the <strong>Sources</strong> tab, the Automaton will check it every hour. It automatically prevents duplicates, fetches the article text, translates and rewrites it using your configured AI (OpenAI or Gemini), and saves it as a WordPress Draft for you to review and publish!</p>';
    }
    
    private function stat_card($title, $value, $color) {
        echo "<div style='background:#f8fafc; border:1px solid #e2e8f0; border-left:4px solid {$color}; padding:20px; border-radius:6px;'>";
        echo "<h3 style='margin:0 0 10px 0; color:#64748b; font-size:14px; text-transform:uppercase;'>{$title}</h3>";
        echo "<div style='font-size:32px; font-weight:800; color:#0f172a;'>{$value}</div>";
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

    private function render_settings() {
        $provider = get_option('ca_ai_provider', 'openai');
        $openai_key = get_option('ca_openai_key', '');
        $gemini_key = get_option('ca_gemini_key', '');
        
        echo '<h2>AI API Settings</h2>';
        echo '<p>Configure the AI engine that will automatically rewrite and translate fetched articles.</p>';
        echo '<form method="post" style="max-width:600px;">';
        
        echo '<table class="form-table">';
        echo '<tr><th><label style="font-weight:bold;">Active AI Provider</label></th><td>';
        echo '<select name="ca_ai_provider" style="width:100%;">';
        echo '<option value="openai" ' . selected($provider, 'openai', false) . '>OpenAI (GPT-4o-mini) - Recommended</option>';
        echo '<option value="gemini" ' . selected($provider, 'gemini', false) . '>Google Gemini (1.5 Flash)</option>';
        echo '</select></td></tr>';
        
        echo '<tr><th><label style="font-weight:bold;">OpenAI API Key</label></th><td>';
        echo '<input type="password" name="ca_openai_key" value="' . esc_attr($openai_key) . '" style="width:100%;">';
        echo '</td></tr>';
        
        echo '<tr><th><label style="font-weight:bold;">Google Gemini API Key</label></th><td>';
        echo '<input type="password" name="ca_gemini_key" value="' . esc_attr($gemini_key) . '" style="width:100%;">';
        echo '</td></tr>';
        echo '</table>';
        
        echo '<input type="hidden" name="ca_save_api_settings" value="1">';
        echo '<p style="margin-top:20px;"><button type="submit" class="button button-primary button-large">Save Settings</button></p>';
        echo '</form>';
    }
}