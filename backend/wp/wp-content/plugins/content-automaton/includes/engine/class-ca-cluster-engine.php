<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_Cluster_Engine {
    public function __construct() {
        add_action('ca_process_clustering_queue', [$this, 'process_clustering']);
    }
    
    public function process_clustering() {
        global $wpdb;
        $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'clustering', 'level' => 'INFO', 'message' => "Starting AI clustering queue..."]);
        
        $urls = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ca_urls WHERE status = 'ready_for_clustering' LIMIT 20");
        if (empty($urls)) {
            $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'clustering', 'level' => 'INFO', 'message' => "No articles ready for clustering."]);
            return;
        }
        
        if (count($urls) == 1) {
            $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'clustered', 'cluster_id' => $urls[0]->id], ['id' => $urls[0]->id]);
            $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'clustering', 'level' => 'INFO', 'message' => "Only 1 article found. Skipping AI cluster and passing to generation."]);
            return;
        }
        
        $payload_items = [];
        foreach ($urls as $u) {
            $response = wp_remote_get($u->url, ['timeout' => 15, 'user-agent' => 'Mozilla/5.0']);
            $title = $u->url;
            if (!is_wp_error($response) && preg_match('/<title>(.*?)<\/title>/is', wp_remote_retrieve_body($response), $matches)) {
                $title = wp_strip_all_tags($matches[1]);
            }
            $payload_items[] = "ID: {$u->id} | Title: {$title}";
        }
        
        $prompt = "You are an AI News clustering bot. Group these news articles into semantic clusters based on their exact topic/event. Group them ONLY if they are reporting on the exact same news event. If an article is unique, put it in a cluster by itself. Return ONLY a valid JSON array of arrays of IDs. Example output: [[1, 2], [3], [4, 5]].\n\nArticles:\n" . implode("\n", $payload_items);
        
        $ai_response = $this->call_provider($prompt);
        if (!$ai_response) return;
        
        $clusters = json_decode($ai_response, true);
        if (!is_array($clusters)) {
            $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'clustering', 'level' => 'ERROR', 'message' => "AI returned invalid JSON for clustering."]);
            return;
        }
        
        foreach ($clusters as $cluster_group) {
            if (empty($cluster_group) || !is_array($cluster_group)) continue;
            $primary_id = intval($cluster_group[0]);
            foreach ($cluster_group as $id) {
                $id = intval($id);
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'clustered', 'cluster_id' => $primary_id], ['id' => $id]);
            }
        }
        
        $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'clustering', 'level' => 'SUCCESS', 'message' => "Successfully clustered " . count($urls) . " articles into " . count($clusters) . " groups."]);
    }
    
    private function call_provider($prompt) {
        $provider = get_option('ca_ai_provider', 'openai');
        
        if ($provider == 'openai') {
            $key = get_option('ca_openai_key');
            if (empty($key)) return false;
            
            $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
                'headers' => ['Authorization' => 'Bearer ' . $key, 'Content-Type' => 'application/json'],
                'body' => json_encode(['model' => 'gpt-4o-mini', 'messages' => [['role' => 'user', 'content' => $prompt]], 'temperature' => 0.2]),
                'timeout' => 45
            ]);
            
            if (is_wp_error($response)) return false;
            $body = json_decode(wp_remote_retrieve_body($response), true);
            return $body['choices'][0]['message']['content'] ?? false;
            
        } elseif ($provider == 'gemini') {
            $key = get_option('ca_gemini_key');
            if (empty($key)) return false;
            
            $response = wp_remote_post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $key, [
                'headers' => ['Content-Type' => 'application/json'],
                'body' => json_encode(['contents' => [['parts' => [['text' => $prompt]]]]]),
                'timeout' => 45
            ]);
            
            if (is_wp_error($response)) return false;
            $body = json_decode(wp_remote_retrieve_body($response), true);
            
            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? false;
            if ($text) {
                $text = preg_replace('/```json\s*/', '', $text);
                $text = preg_replace('/```/', '', $text);
                return trim($text);
            }
            return false;
        }
        return false;
    }
}