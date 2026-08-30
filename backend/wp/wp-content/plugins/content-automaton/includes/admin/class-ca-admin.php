<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_Admin {
    public function __construct() {
        add_action('admin_menu', [ $this, 'add_menu' ]);
    }

    public function add_menu() {
        add_menu_page(
            'Automaton V2',
            'Automaton V2',
            'publish_posts', // Accessible to editors
            'content-automaton',
            [ $this, 'render_dashboard' ],
            'dashicons-admin-network',
            100
        );
    }

    public function render_dashboard() {
        $tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'dashboard';
        
        echo '<div class="wrap">';
        echo '<h1 style="margin-bottom:15px;">Content Automaton: Enterprise Pipeline</h1>';
        echo '<h2 class="nav-tab-wrapper">';
        echo '<a href="?page=content-automaton&tab=dashboard" class="nav-tab ' . ($tab == 'dashboard' ? 'nav-tab-active' : '') . '">Dashboard & Webhook</a>';
        echo '<a href="?page=content-automaton&tab=sources" class="nav-tab ' . ($tab == 'sources' ? 'nav-tab-active' : '') . '">Sources</a>';
        echo '<a href="?page=content-automaton&tab=queue" class="nav-tab ' . ($tab == 'queue' ? 'nav-tab-active' : '') . '">Queue & Deduplication</a>';
        echo '<a href="?page=content-automaton&tab=logs" class="nav-tab ' . ($tab == 'logs' ? 'nav-tab-active' : '') . '">System Logs</a>';
        echo '</h2>';
        
        echo '<div style="background:#fff; padding:20px; border:1px solid #ccc; margin-top:20px; border-radius:4px;">';
        if ($tab == 'dashboard') {
            $this->render_webhook_dashboard();
        } elseif ($tab == 'sources') {
            echo '<h3>Sources Configuration</h3><p>Manage your RSS, Sitemap, and Custom API sources here.</p>';
            // Placeholder for sources UI
            echo '<table class="wp-list-table widefat fixed striped"><thead><tr><th>Name</th><th>URL</th><th>Type</th><th>Target Lang</th><th>Auto Publish</th></tr></thead><tbody><tr><td colspan="5">No sources configured yet.</td></tr></tbody></table>';
        } elseif ($tab == 'queue') {
            echo '<h3>Discovery & Fetch Queue</h3><p>View the multi-stage queue: Discovery -> Extract -> Deduplicate -> Generate -> Publish.</p>';
        } elseif ($tab == 'logs') {
            echo '<h3>System Logs</h3><p>View deduplication events, dead URLs, and API errors.</p>';
        }
        echo '</div>';
        echo '</div>';
    }

    private function render_webhook_dashboard() {
        // Fallback UI to old functionality
        if (isset($_POST['ca_save_settings'])) {
            update_option('ca_webhook_url', esc_url_raw($_POST['ca_webhook_url']));
            echo '<div class="notice notice-success is-dismissible"><p>Webhook Settings saved.</p></div>';
        }
        $webhook_url = get_option('ca_webhook_url', '');
        ?>
        <h2 style="margin-top:0;">External Python Trigger (Legacy / Webhook Mode)</h2>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th><label>Python Webhook URL</label></th>
                    <td>
                        <input type="url" name="ca_webhook_url" value="<?php echo esc_attr($webhook_url); ?>" style="width:100%; max-width:500px;" placeholder="e.g. https://my-python-server.com/trigger">
                    </td>
                </tr>
            </table>
            <input type="hidden" name="ca_save_settings" value="1">
            <button type="submit" class="button button-primary">Save Settings</button>
        </form>

        <h2 style="margin-top:40px; border-top:1px solid #eee; padding-top:20px;">Live Action Console</h2>
        <div style="display:flex; gap:10px; margin-top:20px;">
            <button id="ca-btn-start" class="button button-primary" style="background:#10b981; border-color:#059669;">▶ Start Fetch / Run</button>
            <button id="ca-btn-stop" class="button" style="color:#ef4444; border-color:#ef4444;">⏹ Stop Process</button>
        </div>
        <div id="ca-action-msg" style="margin-top:15px; font-weight:bold;"></div>
        
        <script>
        jQuery(document).ready(function($) {
            var webhookUrl = "<?php echo esc_js($webhook_url); ?>";
            function sendCommand(cmd) {
                if(!webhookUrl) { $('#ca-action-msg').css('color','red').text("Configure webhook first."); return; }
                $.ajax({
                    url: ajaxurl,
                    method: 'POST',
                    data: { action: 'ca_send_command', command: cmd },
                    success: function(res) {
                        $('#ca-action-msg').css('color', res.success ? 'green' : 'red').text(res.data);
                    }
                });
            }
            $('#ca-btn-start').click(function(){ sendCommand('start'); });
            $('#ca-btn-stop').click(function(){ sendCommand('stop'); });
        });
        </script>
        <?php
    }
}