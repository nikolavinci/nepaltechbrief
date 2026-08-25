$baseDir = "C:\Users\anil_\Downloads\Apps\NepTechNews"
$bundleDir = "$baseDir\Namecheap_Bundle"

if (Test-Path $bundleDir) { Remove-Item -Path $bundleDir -Recurse -Force }
New-Item -ItemType Directory -Path $bundleDir | Out-Null

Write-Host "Bundling WordPress Backend..."
Compress-Archive -Path "$baseDir\backend\wp\*" -DestinationPath "$bundleDir\wp-backend.zip" -Force

Write-Host "Bundling Next.js Frontend..."
$tempFrontend = "$baseDir\temp_frontend"
if (Test-Path $tempFrontend) { Remove-Item -Path $tempFrontend -Recurse -Force }
New-Item -ItemType Directory -Path $tempFrontend | Out-Null

Get-ChildItem -Path "$baseDir\apps\web" | Where-Object { $_.Name -ne "node_modules" } | Copy-Item -Destination $tempFrontend -Recurse -Force

Compress-Archive -Path "$tempFrontend\*" -DestinationPath "$bundleDir\nextjs-frontend.zip" -Force
Remove-Item -Path $tempFrontend -Recurse -Force

Write-Host "Bundles created successfully in $bundleDir"
