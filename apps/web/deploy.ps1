$ErrorActionPreference = "Stop"

Write-Host "Starting build..."
$env:NODE_OPTIONS="--max_old_space_size=8192"

# Clean previous out dir
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
}

# Run build
npm run build

if (-Not (Test-Path "out\index.html")) {
    Write-Error "Build failed, out\index.html not found!"
    exit 1
}

Write-Host "Build succeeded. Deploying..."
Set-Location out
git init
New-Item -ItemType File -Name ".nojekyll" -Force
git add .
git commit -m "Safe deploy of out folder"
git push -f https://github.com/nikolavinci/nepaltechbrief.git master:gh-pages
Write-Host "Deployed successfully!"
