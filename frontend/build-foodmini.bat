@echo off
chcp 65001 >nul
echo ========================================
echo    食mini App 自动构建和打包
echo ========================================
echo.

:: 步骤 1: 构建生产版本
echo 步骤 1/3: 构建生产版本...
echo 执行: npm run build
npm run build
if %errorlevel% neq 0 (
    echo ✗ 构建失败!
    pause
    exit /b 1
)
echo ✓ 构建成功!
echo.

:: 步骤 2: 同步到 Android
echo 步骤 2/3: 同步到 Android 项目...
echo 执行: npx cap sync android
npx cap sync android
if %errorlevel% neq 0 (
    echo ✗ 同步失败!
    pause
    exit /b 1
)
echo ✓ 同步成功!
echo.

:: 步骤 3: 打开 Android Studio
echo 步骤 3/3: 打开 Android Studio...
echo 执行: npx cap open android
npx cap open android
if %errorlevel% neq 0 (
    echo ✗ 打开 Android Studio 失败!
    pause
    exit /b 1
)
echo ✓ Android Studio 已打开!
echo.

echo ========================================
echo    所有步骤完成!
echo ========================================
echo.
echo 下一步操作:
echo 1. 在 Android Studio 中点击运行按钮
echo 2. 选择设备或模拟器
echo 3. 开始测试食mini App
echo.
pause