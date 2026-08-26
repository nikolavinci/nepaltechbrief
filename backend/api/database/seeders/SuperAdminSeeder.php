<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = [
            [
                'name' => 'Anil Bhattarai (Superadmin 1)',
                'email' => 'anilbhattarai2003@gmail.com',
                'password' => \Illuminate\Support\Facades\Hash::make('SuperAdmin@2026!X'),
                'role' => 'super_admin',
            ],
            [
                'name' => 'Anil Bhattarai (Superadmin 2)',
                'email' => 'theanilbhattarai@gmail.com',
                'password' => \Illuminate\Support\Facades\Hash::make('NepTechNews#Admin99$'),
                'role' => 'super_admin',
            ],
            [
                'name' => 'Sanjay KC',
                'email' => 'sanjaykc.media@gmail.com',
                'password' => \Illuminate\Support\Facades\Hash::make('NepTechMedia2026!'),
                'role' => 'super_admin',
            ]
        ];

        foreach ($admins as $admin) {
            \App\Models\User::updateOrCreate(
                ['email' => $admin['email']],
                $admin
            );
        }
        // --- Default Categories (Tech Pivot) ---
        $categories = [
            'telecom' => ['en' => 'Telecom', 'np' => 'टेलिकम'],
            'startups' => ['en' => 'Startups', 'np' => 'स्टार्टअप'],
            'apps-software' => ['en' => 'Apps & Software', 'np' => 'एप्स र सफ्टवेयर'],
            'gadgets' => ['en' => 'Gadgets', 'np' => 'ग्याजेट्स'],
        ];

        $categoryIds = [];
        foreach ($categories as $slug => $names) {
            $cat = \App\Models\Category::firstOrCreate(
                ['slug' => $slug],
                ['name_en' => $names['en'], 'name_np' => $names['np']]
            );
            $categoryIds[$slug] = $cat->id;
        }

        // --- Default RSS Feeds ---
        if (\Illuminate\Support\Facades\Schema::hasTable('rss_feeds') && \App\Models\RssFeed::count() === 0) {
            $defaultFeeds = [
                ['name' => 'TechCrunch', 'url' => 'https://techcrunch.com/feed/', 'lang' => 'en', 'cat' => 'startups'],
                ['name' => 'The Verge', 'url' => 'https://www.theverge.com/rss/index.xml', 'lang' => 'en', 'cat' => 'gadgets'],
                ['name' => 'Techmandu', 'url' => 'https://techmandu.com/feed/', 'lang' => 'en', 'cat' => 'gadgets'],
                ['name' => 'Wired', 'url' => 'https://www.wired.com/feed/rss', 'lang' => 'en', 'cat' => 'apps-software'],
                ['name' => 'VentureBeat', 'url' => 'https://feeds.feedburner.com/venturebeat/SZYF', 'lang' => 'en', 'cat' => 'startups'],
            ];

            foreach ($defaultFeeds as $feed) {
                \App\Models\RssFeed::create([
                    'name' => $feed['name'],
                    'url' => $feed['url'],
                    'lang' => $feed['lang'],
                    'category_id' => $categoryIds[$feed['cat']] ?? null,
                    'is_active' => true,
                ]);
            }
        }
    }
}
