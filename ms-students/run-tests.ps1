$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$localMaven = 'C:\Program Files\Maven\apache-maven-3.9.15\bin\mvn.cmd'

if (Test-Path $localMaven) {
    cmd /c "`"$localMaven`" test"
    exit $LASTEXITCODE
}

Set-Location $projectRoot
cmd /c "call .\mvnw.cmd test"
exit $LASTEXITCODE