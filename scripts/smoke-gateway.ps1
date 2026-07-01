param(
    [string]$BaseUrl = "https://velarium.lbourgon.workers.dev"
)

$ErrorActionPreference = "Stop"

$root = $BaseUrl.TrimEnd("/")
$routes = @(
    "/api/health",
    "/api/bootstrap",
    "/api/sources",
    "/api/profiles",
    "/api/profiles/vel",
    "/api/profiles/vel/stories",
    "/api/profiles/vel/social-map",
    "/api/gallery",
    "/api/quotes"
)

foreach ($route in $routes) {
    $uri = "$root$route"
    Write-Host "GET $uri"
    $payload = Invoke-RestMethod -Uri $uri -Headers @{ Accept = "application/json" }
    if ($null -eq $payload.ok -or $payload.ok -ne $true) {
        throw "Route failed contract check: $route"
    }
}

$bootstrap = Invoke-RestMethod -Uri "$root/api/bootstrap" -Headers @{ Accept = "application/json" }
if (-not $bootstrap.profilesById.vel) {
    throw "Bootstrap missing Vel profile"
}
if ($bootstrap.profilesById.vel.handle -ne "@fivesided") {
    throw "Vel handle mismatch"
}
if ($bootstrap.profilesById.kai.name -ne "Kai'Sorynth") {
    throw "Kai canon mismatch"
}
if (-not $bootstrap.routes) {
    throw "Bootstrap missing source route map"
}

Write-Host "Velarium gateway smoke passed for $root"
