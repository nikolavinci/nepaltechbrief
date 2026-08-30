<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_Queue {
    public function __construct() {
        add_filter('cron_schedules', [$this, 'custom_cron_schedule']);
        
        add_action('ca_process_discovery_queue', [$this, 'process_discovery']);
        add_action('ca_process_fetch_queue', [$this, 'process_fetch']);
        
        $status = get_option('ca_engine_status', 'running');
        if ($status == 'running') {
            if (!wp_next_scheduled('ca_process_discovery_queue')) {
                wp_schedule_event(time(), 'ca_custom_interval', 'ca_process_discovery_queue');
            }
            if (!wp_next_scheduled('ca_process_fetch_queue')) {
                wp_schedule_event(time(), 'ca_custom_interval', 'ca_process_fetch_queue');
            }
            if (!wp_next_scheduled('ca_process_generation_queue')) {
                wp_schedule_event(time(), 'ca_custom_interval', 'ca_process_generation_queue');
            }
        }
    }

    public function custom_cron_schedule($schedules) {
        $num = intval(get_option('ca_cron_num', 1));
        $unit = get_option('ca_cron_unit', 'hours');
        if ($num <= 0) $num = 1;
        
        $seconds = 3600;
        if ($unit == 'minutes') $seconds = $num * 60;
        elseif ($unit == 'hours') $seconds = $num * 3600;
        elseif ($unit == 'days') $seconds = $num * 86400;
        
        $schedules['ca_custom_interval'] = array(
            'interval' => $seconds,
            'display'  => "Custom ($num $unit)"
        );
        return $schedules;
    }

    public static function add_url_to_queue($source_id, $url) {
        global $wpdb;
        $url_hash = md5($url);
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}ca_urls WHERE url_hash = %s", $url_hash));
        
        if ($exists) return false;

        $wpdb->insert(
            $wpdb->prefix . 'ca_urls',
            ['source_id' => $source_id, 'url' => $url, 'url_hash' => $url_hash, 'status' => 'pending'],
            ['%d', '%s', '%s', '%s']
        );
        return $wpdb->insert_id;
    }

    public function process_discovery() {
        global $wpdb;
        $sources = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ca_sources WHERE enabled = 1");
        if (empty($sources)) return;
        
        include_once( ABSPATH . WPINC . '/feed.php' );

        foreach ($sources as $source) {
            if ($source->type == 'rss') {
                $rss = fetch_feed( $source->url );
                if ( is_wp_error( $rss ) ) continue;
                $maxitems = $rss->get_item_quantity( 5 ); 
                $rss_items = $rss->get_items( 0, $maxitems );
                
                $added = 0;
                foreach ( $rss_items as $item ) {
                    if ($item->get_permalink() && self::add_url_to_queue($source->id, $item->get_permalink())) {
                        $added++;
                    }
                }
                if ($added > 0) {
                    $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'discovery', 'level' => 'INFO', 'message' => "Discovered $added new URLs from source {$source->name}", 'source_id' => $source->id]);
                }
            }
        }
    }

    public function process_fetch() {
        global $wpdb;
        $urls = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ca_urls WHERE status = 'pending' ORDER BY id ASC LIMIT 5");
        if (empty($urls)) return;
        
        foreach ($urls as $url_row) {
            $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'processing'], ['id' => $url_row->id]);
            $response = wp_remote_get($url_row->url, ['timeout' => 15]);
            
            if (is_wp_error($response)) {
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'failed', 'retry_count' => $url_row->retry_count + 1], ['id' => $url_row->id]);
                continue;
            }
            if (wp_remote_retrieve_response_code($response) != 200) {
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'dead'], ['id' => $url_row->id]);
                continue;
            }
            
            $content_hash = md5(wp_remote_retrieve_body($response));
            $content_exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}ca_urls WHERE content_hash = %s AND id != %d", $content_hash, $url_row->id));
            
            if ($content_exists) {
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'duplicate', 'content_hash' => $content_hash], ['id' => $url_row->id]);
                continue;
            }
            
            $wpdb->update($wpdb->prefix . 'ca_urls', [
                'status' => 'ready_for_ai', 'content_hash' => $content_hash, 'processed_at' => current_time('mysql')
            ], ['id' => $url_row->id]);
        }
    }
}