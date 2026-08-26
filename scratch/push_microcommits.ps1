cd C:\Users\anil_\Downloads\Apps\NepTechNews

$author1 = "Aanshhuu <Aanshhuu@users.noreply.github.com>"
$author2 = "anillovescoding <anillovescoding@users.noreply.github.com>"

# 1. Rebranding and Layout
git add apps/web/src/app/about/page.tsx apps/web/src/app/contact/page.tsx apps/web/src/app/privacy/page.tsx apps/web/src/app/terms/page.tsx apps/web/src/app/team/page.tsx apps/web/src/app/layout.tsx apps/web/src/components/layout/Header.tsx apps/web/src/components/layout/Footer.tsx apps/web/src/components/auth/LoginForm.tsx apps/web/src/components/home/TechInsights.tsx
git commit --author=$author1 -m "refactor: global rebrand to NepTechBrief and layout fixes"

# 2. Ads Plugin (WordPress)
git add backend/wp/wp-content/plugins/nikolavinci-ads-manager/ backend/wp/wp-content/plugins/content-automaton/
git commit --author=$author2 -m "feat: custom headless WP ads manager & content automaton plugin"

# 3. Dynamic Ads Components
git add apps/web/src/components/ads/ apps/web/src/app/page.tsx
git commit --author=$author1 -m "feat: dynamic frontend ads evaluation and analytics integration"

# 4. Real Author Sync
git add apps/web/src/lib/api.ts apps/web/src/app/author/[slug]/page.tsx apps/web/src/app/news/[slug]/page.tsx
git commit --author=$author2 -m "feat: sync authors with real WP users, roles, and profiles"

# 5. Cleanup
git add apps/web/src/app/admin/ apps/web/src/app/login/ apps/web/src/app/search/ apps/web/src/app/[category]/ apps/web/src/app/web-stories/
git commit --author=$author1 -m "chore: remove legacy laravel pages and unused routing"

# 6. Bundle & Everything else
git add .
git commit --author=$author2 -m "chore: finalize Namecheap production builds and config"

# Push to origin
git push origin main
Write-Host "Microcommits pushed successfully!"
