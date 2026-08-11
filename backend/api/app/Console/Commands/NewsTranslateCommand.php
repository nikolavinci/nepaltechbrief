<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;

class NewsTranslateCommand extends Command
{
    protected $signature = 'news:translate';
    protected $description = 'Translate English articles to Nepali';

    public function handle()
    {
        // Find articles where title_np is null or empty, or same as title_en
        $articles = Article::whereNull('title_np')
            ->orWhere('title_np', '')
            ->orWhereColumn('title_np', 'title_en')
            ->get();

        $this->info("Found " . $articles->count() . " articles to translate.");

        foreach ($articles as $article) {
            $this->info("Translating: {$article->title_en}");

            if ($article->title_en) {
                $translatedTitle = $this->translateText($article->title_en);
                if ($translatedTitle) {
                    $article->title_np = $translatedTitle;
                }
            }

            if ($article->body_en && empty($article->body_np)) {
                // Translate body in chunks to avoid URL length limits
                $translatedBody = $this->translateHtml($article->body_en);
                if ($translatedBody) {
                    $article->body_np = $translatedBody;
                }
            }

            $article->save();
            sleep(1); // rate limiting
        }

        $this->info("Translation complete.");
    }

    private function translateText($text)
    {
        if (empty(trim($text))) return $text;
        
        $url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ne&dt=t&q=" . urlencode($text);
        
        try {
            $response = file_get_contents($url);
            $json = json_decode($response, true);
            
            $translatedText = '';
            if (isset($json[0]) && is_array($json[0])) {
                foreach ($json[0] as $segment) {
                    if (isset($segment[0])) {
                        $translatedText .= $segment[0];
                    }
                }
            }
            return $translatedText ?: null;
        } catch (\Exception $e) {
            $this->error("Failed to translate text: " . $e->getMessage());
            return null;
        }
    }

    private function translateHtml($html)
    {
        // A very basic HTML translator that strips tags, translates, and returns plain text.
        // For a full robust solution, a DOM parser is needed, but for simple articles, text is often enough.
        $text = strip_tags($html);
        
        // Split into sentences or chunks if too long (Google GET API limit is ~2000 chars)
        $chunks = str_split($text, 1500);
        $translatedHtml = '';
        
        foreach ($chunks as $chunk) {
            $translated = $this->translateText($chunk);
            if ($translated) {
                $translatedHtml .= "<p>{$translated}</p>";
            }
            sleep(1);
        }
        
        return $translatedHtml;
    }
}
