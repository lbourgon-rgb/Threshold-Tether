$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')

& wrangler deploy (Join-Path $root 'src\legacy-redirect-worker.js') `
    --name threshold-tether `
    --compatibility-date 2026-07-01
