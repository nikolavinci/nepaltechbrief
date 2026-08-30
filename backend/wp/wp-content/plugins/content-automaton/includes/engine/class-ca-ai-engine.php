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
        
        // Grab unique cluster IDs that have clustered or ai_failed status
        $cluster_query = "SELECT DISTINCT cluster_id FROM {$wpdb->prefix}ca_urls WHERE (status = 'clustered' OR status = 'ai_failed') AND retry_count < 3 LIMIT 2";
        $cluster_ids = $wpdb->get_col($cluster_query);
        
        if (empty($cluster_ids)) {
            $wpdb->insert($wpdb->prefix . 'ca_logs', ['action' => 'generation', 'level' => 'INFO', 'message' => "No clusters ready for AI generation."]);
            return;
        }
        
        // Get internal links for SEO context
        $recent_posts = get_posts(['numberposts' => 10, 'post_status' => 'publish']);
        $internal_links_context = "";
        foreach ($recent_posts as $rp) {
            $internal_links_context .= "- " . esc_html($rp->post_title) . " (URL: " . get_permalink($rp->ID) . ")\n";
        }
        
        foreach ($cluster_ids as $cluster_id) {
            $urls = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}ca_urls WHERE cluster_id = %d", $cluster_id));
            if (empty($urls)) continue;
            
            $source = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}ca_sources WHERE id = %d", $urls[0]->source_id));
            
            // Mark all as generating
            foreach ($urls as $u) {
                $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'generating'], ['id' => $u->id]);
            }
            
            $combined_text = "";
            $fetch_failed = false;
            foreach ($urls as $i => $u) {
                $response = wp_remote_get($u->url, [
                    'timeout' => 30,
                    'user-agent' => 'Mozilla/5.0',
                    'sslverify' => false
                ]);
                
                if (is_wp_error($response) || wp_remote_retrieve_response_code($response) != 200) {
                    $fetch_failed = true;
                    break;
                }
                
                $body = wp_remote_retrieve_body($response);
                $clean_text = wp_strip_all_tags($body);
                $clean_text = substr($clean_text, 0, 8000);
                $combined_text .= "--- SOURCE " . ($i+1) . " ---\n" . $clean_text . "\n\n";
            }
            
            if ($fetch_failed) {
                foreach ($urls as $u) {
                    $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'fetch_failed', 'retry_count' => $u->retry_count + 1], ['id' => $u->id]);
                }
                continue;
            }
            
            $base_prompt = get_option('ca_custom_prompt', 'Reword this article including the title and write it in Nepali to avoid plagiarism and suggest prompt for AI image generation, slug, tags, category (english) and nepali, meta description.');
            
            $synthesis_rules = "CRITICAL INSTRUCTIONS:\n";
            $synthesis_rules .= "1. SYNTHESIS: You have been provided multiple sources for the exact same event. Synthesize them into ONE comprehensive original article.\n";
            $synthesis_rules .= "2. STRIP COMPETITORS: Do not mention the original source publishers, authors, or brands (e.g. 'According to TechPana', 'OnlineKhabar reports').\n";
            $synthesis_rules .= "3. NO EXTERNAL LINKS: Strip any external HTML links from the content.\n";
            $synthesis_rules .= "4. INTERNAL SEO LINKS: Naturally insert 2 to 3 HTML links inside the text pointing to these related articles from our site. Make the anchor text natural:\n" . $internal_links_context . "\n";
            
            $lang_slug = get_option('ca_lang_slug', 'english');
            $lang_meta = get_option('ca_lang_meta', 'english');
            $json_schema = '{"title": "Nepali Title", "content": "HTML formatted content (p, h2, a)", "image_prompt": "English prompt for image generation", "slug": "URL slug in ' . $lang_slug . '", "tags_en": "comma, separated, english, tags", "tags_ne": "comma, separated, nepali, tags", "category_en": "category", "category_ne": "category", "meta_desc": "160 char SEO description in ' . $lang_meta . '", "focus_keyword": "main focus keyword"}';
            
            $prompt = $base_prompt . "\n\n" . $synthesis_rules . "\nReturn ONLY a valid JSON object matching this exact structure: " . $json_schema . "\n\nTEXT SOURCES:\n" . $combined_text;
            
            $ai_response = $this->call_provider($prompt);
            
            if (!$ai_response) {
                foreach ($urls as $u) {
                    $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'ai_failed', 'retry_count' => $u->retry_count + 1], ['id' => $u->id]);
                }
                continue;
            }
            
            $data = json_decode($ai_response, true);
            if (!$data || !isset($data['title']) || !isset($data['content'])) {
                $this->log_error("AI returned invalid JSON format for cluster {$cluster_id}");
                foreach ($urls as $u) {
                    $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'ai_failed', 'retry_count' => $u->retry_count + 1], ['id' => $u->id]);
                }
                continue;
            }
            
            $lang_tags = get_option('ca_lang_tags', 'bilingual');
            $final_tags = [];
            if ($lang_tags == 'english' || $lang_tags == 'bilingual') {
                if (!empty($data['tags_en'])) $final_tags[] = $data['tags_en'];
            }
            if ($lang_tags == 'nepali' || $lang_tags == 'bilingual') {
                if (!empty($data['tags_ne'])) $final_tags[] = $data['tags_ne'];
            }
            $tags_input = implode(',', $final_tags);
            
            $post_status = ($source && $source->auto_publish) ? 'publish' : 'draft';
            
            $post_data = [
                'post_title' => sanitize_text_field($data['title']),
                'post_content' => wp_kses_post($data['content']), // wp_kses_post allows <a> tags
                'post_status' => $post_status,
                'post_author' => 1,
                'tags_input' => sanitize_text_field($tags_input)
            ];
            if ($source) $post_data['post_category'] = [$source->default_category];
            if (!empty($data['slug'])) $post_data['post_name'] = sanitize_title($data['slug']);
            
            $post_id = wp_insert_post($post_data);
            
            if ($post_id && !is_wp_error($post_id)) {
                if (!empty($data['meta_desc'])) update_post_meta($post_id, '_ai_meta_description', sanitize_text_field($data['meta_desc']));
                if (!empty($data['focus_keyword'])) update_post_meta($post_id, '_ai_focus_keyword', sanitize_text_field($data['focus_keyword']));
                if (!empty($data['image_prompt'])) update_post_meta($post_id, '_ai_image_prompt', sanitize_text_field($data['image_prompt']));
                if (!empty($data['category_en'])) update_post_meta($post_id, '_ai_category_en', sanitize_text_field($data['category_en']));
                if (!empty($data['category_ne'])) update_post_meta($post_id, '_ai_category_ne', sanitize_text_field($data['category_ne']));
                
                // Track all clustered URLs that mapped to this post
                $original_urls = [];
                foreach ($urls as $u) {
                    $original_urls[] = $u->url;
                    $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'draft_created', 'post_id' => $post_id], ['id' => $u->id]);
                }
                update_post_meta($post_id, 'ca_original_url', implode("\n", $original_urls));
                
                $this->log_success("Successfully synthesized cluster {$cluster_id} (" . count($urls) . " sources) into article: " . $data['title']);
            } else {
                $this->log_error("Failed to insert synthesized post into DB for cluster {$cluster_id}");
                foreach ($urls as $u) {
                    $wpdb->update($wpdb->prefix . 'ca_urls', ['status' => 'wp_failed', 'retry_count' => $u->retry_count + 1], ['id' => $u->id]);
                }
            }
        }
    }
    
    private function call_provider($prompt) {
        $provider = get_option('ca_ai_provider', 'openai');
        
        if ($provider == 'openai') {
            $key = get_option('ca_openai_key');
            if (empty($key)) {
                $this->log_error("OpenAI API Key is missing. Generation paused.");
                return false;
            }
            
            $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
                'headers' => ['Authorization' => 'Bearer ' . $key, 'Content-Type' => 'application/json'],
                'body' => json_encode(['model' => 'gpt-4o-mini', 'messages' => [['role' => 'user', 'content' => $prompt]], 'temperature' => 0.7, 'response_format' => ['type' => 'json_object']]),
                'timeout' => 90 // Increased timeout due to synthesis complexity
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
                $this->log_error("Gemini API Key is missing. Generation paused.");
                return false;
            }
            
            $response = wp_remote_post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $key, [
                'headers' => ['Content-Type' => 'application/json'],
                'body' => json_encode(['contents' => [['parts' => [['text' => $prompt]]]], 'generationConfig' => ['responseMimeType' => 'application/json']]),
                'timeout' => 90
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