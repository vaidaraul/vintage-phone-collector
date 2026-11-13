param(
    [string]$Work = (Join-Path $PSScriptRoot '..\..\..\..\root-work'),
    [string]$Node = "node.exe",
    [int]$CaptureSeconds = 200
)

$ErrorActionPreference = 'Stop'

$toolDir = Join-Path $Work 'Bravo_Archive\revolutionary-0.4pre4-patched'
$toolExe = Join-Path $toolDir 'revolutionary-nocheck.exe'
$emulate = Join-Path $PSScriptRoot 'emulate.js'
$elog = Join-Path $PSScriptRoot 'emu-run.log'
$eerr = Join-Path $PSScriptRoot 'emu-run.err'

foreach ($f in @($elog, $eerr)) {
    if (Test-Path $f) { Remove-Item $f -Force }
}

Get-Process revolutionary,revolutionary-nocheck,adb -ErrorAction SilentlyContinue |
    Stop-Process -Force -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*emulate.js*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

if (-not (Test-Path $toolExe)) {
    throw "Patched tool not found: $toolExe. Set -Work to the folder that contains Bravo_Archive."
}
if (-not (Test-Path $emulate)) {
    throw "Emulator not found: $emulate"
}

$n = Start-Process -FilePath $Node `
    -ArgumentList $emulate, 'revolutionary-nocheck.exe' `
    -RedirectStandardOutput $elog `
    -RedirectStandardError $eerr `
    -PassThru -NoNewWindow
Start-Sleep -Milliseconds 700

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $toolExe
$psi.WorkingDirectory = $toolDir
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true
$p = [System.Diagnostics.Process]::Start($psi)
$outTask = $p.StandardOutput.ReadToEndAsync()
$errTask = $p.StandardError.ReadToEndAsync()
'started tool pid ' + $p.Id

Start-Sleep -Seconds $CaptureSeconds
if (-not $p.HasExited) { $p.Kill() }
if (-not $n.HasExited) { $n.Kill() }
Start-Sleep -Seconds 2

'--- TOOL STDOUT ---'
try { $outTask.Result } catch { 'stdout err: ' + $_ }
'--- TOOL STDERR ---'
try { $errTask.Result } catch { 'stderr err: ' + $_ }
'--- EMU FILTERED ---'
Get-Content $elog -ErrorAction SilentlyContinue |
    Where-Object { $_ -match 'W len=|R cmd=|DLDONE|EPINFO|OPENEP|REBOOT|CLOSED|GEN-|inject|missing|script:' } |
    Select-Object -First 300
'--- EMU ERR ---'
Get-Content $eerr -ErrorAction SilentlyContinue
