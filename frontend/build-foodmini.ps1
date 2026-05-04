# 食mini App 自动构建和打包脚本
# 使用方法：在 frontend 目录下运行 ./build-foodmini.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   食mini App 自动构建和打包" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 构建生产版本
Write-Host "步骤 1/3: 构建生产版本..." -ForegroundColor Yellow
Write-Host "执行: npm run build" -ForegroundColor Gray
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 构建成功!" -ForegroundColor Green
    } else {
        Write-Host "✗ 构建失败!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 构建过程出错: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤 2: 同步到 Android
Write-Host "步骤 2/3: 同步到 Android 项目..." -ForegroundColor Yellow
Write-Host "执行: npx cap sync android" -ForegroundColor Gray
try {
    npx cap sync android
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 同步成功!" -ForegroundColor Green
    } else {
        Write-Host "✗ 同步失败!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 同步过程出错: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤 3: 打开 Android Studio
Write-Host "步骤 3/3: 打开 Android Studio..." -ForegroundColor Yellow
Write-Host "执行: npx cap open android" -ForegroundColor Gray
try {
    npx cap open android
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Android Studio 已打开!" -ForegroundColor Green
    } else {
        Write-Host "✗ 打开 Android Studio 失败!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 打开过程出错: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   所有步骤完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 在 Android Studio 中点击运行按钮" -ForegroundColor White
Write-Host "2. 选择设备或模拟器" -ForegroundColor White
Write-Host "3. 开始测试食mini App" -ForegroundColor White
Write-Host ""