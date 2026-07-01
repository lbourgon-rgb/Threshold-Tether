$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$outDir = Join-Path $root '.velarium-local'
$keyPath = Join-Path $outDir 'ios_distribution_private_key'

if (-not (Get-Command ssh-keygen -ErrorAction SilentlyContinue)) {
    throw 'ssh-keygen was not found on this machine. Install OpenSSH Client or generate the RSA key from another trusted machine.'
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (Test-Path -LiteralPath $keyPath) {
    Write-Host "Key already exists: $keyPath"
    Write-Host 'Not overwriting it.'
    exit 0
}

& ssh-keygen -t rsa -b 2048 -m PEM -f $keyPath -q -N ""

Write-Host "Created private key: $keyPath"
Write-Host 'Copy the entire file contents into Codemagic as the protected CERTIFICATE_PRIVATE_KEY variable.'
Write-Host 'Do not commit or share this key.'
