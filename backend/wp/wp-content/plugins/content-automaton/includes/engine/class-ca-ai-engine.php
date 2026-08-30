<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class CA_AI_Engine {
    public function __construct() {
        add_action('ca_process_generation_queue', [$this, 'process_generation']);
        if (!wp_next_scheduled('ca_process_generation_queue')) {
            wp_schedule_event(time(), 'ca_custom_interval', 'ca_process_generation_queue');
        }
    }
    
    public function process_generation() {
        global $wpdb;
        $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'generation', 'level' => 'INFO', 'message' => "Starting AI generation queue..."]);
        
        $urls = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}ca_urls WHERE status = 'ready_for_ai' LIMIT 3");
        if (empty($urls)) {
            $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'generation', 'level' => 'INFO', 'message' => "No articles ready for AI generation."]);
            return;
        }
        
        foreach ($urls as $url_row) {
            $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'generating'], ['id' => $url_row->id]);
            
            $source = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}ca_sources WHERE id = %d", $url_row->source_id));
            if (!$source) continue;
            
            $response = wp_remote_get($url_row->url, ['timeout' => 15]);
            if (is_wp_error($response)) {
                $this->log_error("Failed to fetch article body for {$url_row->url}");
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'failed'], ['id' => $url_row->id]);
                continue;
            }
            
            $body = wp_remote_retrieve_body($response);
            $clean_text = wp_strip_all_tags($body);
            $clean_text = substr($clean_text, 0, 8000); 
            
            $prompt = "You are a professional tech journalist for NepTechBrief. Rewrite this news article into Nepali. Make it engaging, factual, and SEO optimized. Format with HTML tags (h2, p). Return ONLY a JSON object with this exact format: {\"title\": \"Nepali Title\", \"content\": \"HTML content\", \"meta_desc\": \"160 char SEO description\", \"keywords\": \"comma, separated, tags\"}. Here is the text: " . $clean_text;
            
            $ai_response = $this->call_provider($prompt);
            
            if (!$ai_response) {
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'failed'], ['id' => $url_row->id]);
                continue;
            }
            
            $data = json_decode($ai_response, true);
            if (!$data || !isset($data['title']) || !isset($data['content'])) {
                $this->log_error("AI returned invalid JSON format for {$url_row->url}");
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'failed'], ['id' => $url_row->id]);
                continue;
            }
            
            $post_status = $source->auto_publish ? 'publish' : 'draft';
            $post_id = wp_insert_post([
                'post_title' => sanitize_text_field($data['title']),
                'post_content' => wp_kses_post($data['content']),
                'post_status' => $post_status,
                'post_author' => 1,
                'post_category' => [$source->default_category],
                'tags_input' => sanitize_text_field($data['keywords'] ?? '')
            ]);
            
            if ($post_id) {
                if (!empty($data['meta_desc'])) update_post_meta($post_id, '_ai_meta_description', sanitize_text_field($data['meta_desc']));
                update_post_meta($post_id, '_ai_focus_keyword', sanitize_text_field($data['keywords'] ?? ''));
                update_post_meta($post_id, 'ca_original_url', $url_row->url);
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'draft_created', 'post_id' => $post_id], ['id' => $url_row->id]);
                
                $this->log_success("Successfully drafted article: " . $data['title']);
            }
        }
    }
    
    private function call_provider($prompt) {
        $provider = get_option('ca_ai_provider', 'openai');
        
        if ($provider == 'openai') {
            $key = get_option('ca_openai_key');
            if (empty($key)) {
                $this->log_error("OpenAI API Key is missing.");
                return false;
            }
            
            $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
                'headers' => ['Authorization' => 'Bearer ' . $key, 'Content-Type' => 'application/json'],
                'body' => json_encode(['model' => 'gpt-4o-mini', 'messages' => [['role' => 'user', 'content' => $prompt]], 'temperature' => 0.7, 'response_format' => ['type' => 'json_object']]),
                'timeout' => 45
            ]);
            
            if (is_wp_error($response)) {
                $this->log_error("OpenAI Connection Error: " . $response->get_error_message());
                return false;
            }
            
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($body['error'])) {
                $this->log_error("OpenAI API Error: " . $body['error']['message']);
                return false;
            }
            
            return $body['choices'][0]['message']['content'] ?? false;
            
        } elseif ($provider == 'gemini') {
            $key = get_option('ca_gemini_key');
            if (empty($key)) {
                $this->log_error("Gemini API Key is missing.");
                return false;
            }
            
            $response = wp_remote_post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $key, [
                'headers' => ['Content-Type' => 'application/json'],
                'body' => json_encode(['contents' => [['parts' => [['text' => $prompt]]]], 'generationConfig' => ['responseMimeType' => 'application/json']]),
                'timeout' => 45
            ]);
            
            if (is_wp_error($response)) {
                $this->log_error("Gemini Connection Error: " . $response->get_error_message());
                return false;
            }
            
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (isset($body['error'])) {
                $this->log_error("Gemini API Error: " . $body['error']['message']);
                return false;
            }
            
            return $body['candidates'][0]['content']['parts'][0]['text'] ?? false;
        }
        return false;
    }
    
    private function log_error($message) {
        global $wpdb;
        $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'generation', 'level' => 'ERROR', 'message' => $message]);
    }
    private function log_success($message) {
        global $wpdb;
        $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'generation', 'level' => 'SUCCESS', 'message' => $message]);
    }
}