#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Integration test: valida Fases 1-4 funcionando juntas.
    Prueba el flujo completo: Gateway → Service Discovery (lb://) → Assessment Layer (error codes)
.DESCRIPTION
    - Requiere Docker Desktop corriendo
    - Usa docker-compose para levantar los 6 servicios
    - Tests: health checks, routing, error codes, BFF aggregator, Admin Server
    - Cleanup automático al final
#>

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot
$COMPOSE_DIR = Join-Path $ROOT "Infra"
$COMPOSE_FILE = Join-Path $COMPOSE_DIR "docker-compose.yml"
$GATEWAY_URL = "http://localhost:8080"
$ADMIN_URL = "http://localhost:8084"
$BFF_URL = "http://localhost:8083"

$PASS = 0
$FAIL = 0
$ERRORS = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [string]$ExpectedBody = $null
    )

    try {
        $response = Invoke-WebRequest -Method $Method -Uri $Url -UseBasicParsing -SkipCertificateCheck -TimeoutSec 10
        $statusOk = $response.StatusCode -eq $ExpectedStatus
        $bodyOk = $true
        if ($ExpectedBody) {
            $bodyOk = $response.Content -match $ExpectedBody
        }
        if ($statusOk -and $bodyOk) {
            Write-Host "  [PASS] $Name" -ForegroundColor Green
            $script:PASS++
        } else {
            Write-Host "  [FAIL] $Name (status $($response.StatusCode) / expected $ExpectedStatus)" -ForegroundColor Red
            $script:FAIL++
            $script:ERRORS += "$Name : status $($response.StatusCode), expected $ExpectedStatus"
        }
    } catch {
        Write-Host "  [FAIL] $Name - $_" -ForegroundColor Red
        $script:FAIL++
        $script:ERRORS += "$Name : $_"
    }
}

function Test-EndpointError {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 404,
        [string]$ExpectedCode = $null
    )

    try {
        $response = Invoke-WebRequest -Method GET -Uri $Url -UseBasicParsing -SkipCertificateCheck -TimeoutSec 10
        $statusOk = $response.StatusCode -eq $ExpectedStatus
        $bodyOk = $true
        if ($ExpectedCode) {
            $bodyOk = $response.Content -match $ExpectedCode
        }
        if ($statusOk -and $bodyOk) {
            Write-Host "  [PASS] $Name" -ForegroundColor Green
            $script:PASS++
        } else {
            Write-Host "  [FAIL] $Name (status $($response.StatusCode) / expected $ExpectedStatus)" -ForegroundColor Red
            $script:FAIL++
            $script:ERRORS += "$Name : status $($response.StatusCode), expected $ExpectedStatus"
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq $ExpectedStatus) {
            Write-Host "  [PASS] $Name (error code match)" -ForegroundColor Green
            $script:PASS++
        } else {
            Write-Host "  [FAIL] $Name - $_" -ForegroundColor Red
            $script:FAIL++
            $script:ERRORS += "$Name : $_"
        }
    }
}

function Wait-ForHealth {
    param([string]$Url, [string]$Name, [int]$TimeoutSeconds = 180)
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        try {
            $r = Invoke-WebRequest -Uri "$Url/actuator/health" -UseBasicParsing -SkipCertificateCheck -TimeoutSec 5
            if ($r.StatusCode -eq 200) {
                Write-Host "  $Name healthy after ${elapsed}s" -ForegroundColor Green
                return $true
            }
        } catch {}
        Start-Sleep -Seconds 5
        $elapsed += 5
    }
    Write-Host "  [TIMEOUT] $Name not healthy after ${TimeoutSeconds}s" -ForegroundColor Red
    return $false
}

# ============================================================
# MAIN
# ============================================================
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " INTEGRATION TEST — Fases 1-4" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. Build + Start
Write-Host "`n[1/4] Building Docker images..." -ForegroundColor Yellow
Set-Location -LiteralPath $COMPOSE_DIR
docker compose build -q 2>&1
$buildExit = $LASTEXITCODE
Set-Location -LiteralPath $ROOT
if ($buildExit -ne 0) {
    Write-Host "[BUILD FAILED] docker compose build exit code $buildExit" -ForegroundColor Red
    exit 1
}
Write-Host "  Build OK" -ForegroundColor Green

Write-Host "`n[2/4] Starting services..." -ForegroundColor Yellow
Set-Location -LiteralPath $COMPOSE_DIR
docker compose up -d --wait 2>&1
$upExit = $LASTEXITCODE
Set-Location -LiteralPath $ROOT
if ($upExit -ne 0) {
    Write-Host "[START FAILED] docker compose up exit code $upExit" -ForegroundColor Red
    Set-Location -LiteralPath $COMPOSE_DIR
    docker compose ps
    Set-Location -LiteralPath $ROOT
    exit 1
}

# 2. Wait for all services
Write-Host "`n[3/4] Waiting for all services (up to 3 min)..." -ForegroundColor Yellow
$allHealthy = $true
$services = @(
    @{Url="http://localhost:8761"; Name="discovery-server"},
    @{Url="http://localhost:8081"; Name="ms-students"},
    @{Url="http://localhost:8082"; Name="ms-attendance"},
    @{Url=$GATEWAY_URL; Name="api-gateway"},
    @{Url=$BFF_URL; Name="backend-bff"},
    @{Url=$ADMIN_URL; Name="admin-server"}
)
foreach ($svc in $services) {
    if (-not (Wait-ForHealth -Url $svc.Url -Name $svc.Name)) {
        $allHealthy = $false
    }
}

if (-not $allHealthy) {
    Write-Host "`n[ABORT] Not all services are healthy. See docker compose ps:" -ForegroundColor Red
    Set-Location -LiteralPath $COMPOSE_DIR
    docker compose ps
    docker compose logs --tail=20 discovery-server
    Set-Location -LiteralPath $ROOT
    exit 1
}

# 3. Run tests
Write-Host "`n[4/4] Running tests..." -ForegroundColor Yellow

Write-Host "`n--- Discovery Server ---" -ForegroundColor Magenta
Test-Endpoint -Name "Eureka dashboard" -Url "http://localhost:8761"

Write-Host "`n--- Gateway Routing (Fase 3 + Fase 2) ---" -ForegroundColor Magenta
Test-Endpoint -Name "Gateway health" -Url "$GATEWAY_URL/actuator/health"
Test-Endpoint -Name "GET /api/estudiantes/ (empty list)" -Url "$GATEWAY_URL/api/estudiantes/"

Write-Host "`n--- Assessment Layer - Error Codes (Fase 1) ---" -ForegroundColor Magenta
Test-EndpointError -Name "GET /api/estudiantes/999 → ENTITY-001" -Url "$GATEWAY_URL/api/estudiantes/999" -ExpectedStatus 404 -ExpectedCode "ENTITY-001"

Write-Host "`n--- BFF Health Aggregator (Fase 2) ---" -ForegroundColor Magenta
Test-Endpoint -Name "BFF health - status UP" -Url "$BFF_URL/actuator/health" -ExpectedBody '"status":"UP"'

Write-Host "`n--- Admin Server (Fase 4) ---" -ForegroundColor Magenta
Test-Endpoint -Name "Admin Server health" -Url "$ADMIN_URL/actuator/health"

Write-Host "`n--- Prometheus Metrics ---" -ForegroundColor Magenta
Test-Endpoint -Name "Prometheus target" -Url "http://localhost:9090/-/ready"

# 4. Results
Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host " RESULTS" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  PASS: $PASS" -ForegroundColor Green
Write-Host "  FAIL: $FAIL" -ForegroundColor Red

if ($ERRORS.Count -gt 0) {
    Write-Host "`nErrors:" -ForegroundColor Red
    foreach ($e in $ERRORS) {
        Write-Host "  - $e" -ForegroundColor Red
    }
}

# 5. Cleanup
Write-Host "`nCleaning up..." -ForegroundColor Yellow
Set-Location -LiteralPath $COMPOSE_DIR
docker compose down --volumes 2>&1 | Out-Null
Set-Location -LiteralPath $ROOT
Write-Host "  Done." -ForegroundColor Green

if ($FAIL -gt 0) {
    exit 1
}
exit 0
