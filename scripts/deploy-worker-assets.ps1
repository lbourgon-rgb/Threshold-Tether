$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$deployRoot = Join-Path $env:TEMP "threshold-tether-deploy-$stamp"

New-Item -ItemType Directory -Path $deployRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $deployRoot 'assets') | Out-Null

$staticFiles = @(
    'index.html',
    'styles.css',
    'app.js',
    'manifest.webmanifest',
    'service-worker.js'
)

foreach ($file in $staticFiles) {
    Copy-Item -LiteralPath (Join-Path $root $file) -Destination $deployRoot
}

Copy-Item -LiteralPath (Join-Path $root 'assets\gallery') -Destination (Join-Path $deployRoot 'assets') -Recurse
Copy-Item -LiteralPath (Join-Path $root 'assets\icons') -Destination (Join-Path $deployRoot 'assets') -Recurse

& wrangler deploy (Join-Path $root 'src\worker.js') `
    --name threshold-tether `
    --compatibility-date 2026-07-01 `
    --assets $deployRoot
