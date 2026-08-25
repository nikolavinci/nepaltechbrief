$baseDir = "C:\Users\anil_\Downloads\Apps\NepTechNews"
$bundleDir = "$baseDir\Namecheap_Bundle"
$standaloneDir = "$baseDir\apps\web\.next\standalone"
$targetDir = "$baseDir\temp_standalone"

# Clear target dir
if (Test-Path $targetDir) { Remove-Item -Path $targetDir -Recurse -Force }
New-Item -ItemType Directory -Path $targetDir | Out-Null

# Copy standalone output
Copy-Item -Path "$standaloneDir\*" -Destination $targetDir -Recurse -Force

# Next.js standalone doesn't copy public or static folders by default. We need to copy them manually.
# In a monorepo, the app is inside apps/web
$webAppDir = "$targetDir\apps\web"

if (-not (Test-Path "$webAppDir\.next\static")) {
    New-Item -ItemType Directory -Path "$webAppDir\.next\static" -Force | Out-Null
}
Copy-Item -Path "$baseDir\apps\web\.next\static\*" -Destination "$webAppDir\.next\static" -Recurse -Force

if (Test-Path "$baseDir\apps\web\public") {
    if (-not (Test-Path "$webAppDir\public")) {
        New-Item -ItemType Directory -Path "$webAppDir\public" -Force | Out-Null
    }
    Copy-Item -Path "$baseDir\apps\web\public\*" -Destination "$webAppDir\public" -Recurse -Force
}

Write-Host "Zipping optimized standalone bundle..."
Compress-Archive -Path "$targetDir\*" -DestinationPath "$bundleDir\nextjs-frontend-optimized.zip" -Force
Remove-Item -Path $targetDir -Recurse -Force

Write-Host "Zip created at $bundleDir\nextjs-frontend-optimized.zip"
