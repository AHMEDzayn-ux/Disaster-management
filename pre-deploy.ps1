# AWS Amplify Deployment - Pre-Flight Checklist
# Run this script before deploying to verify everything is ready

Write-Host "🚀 AWS Amplify Deployment Pre-Flight Checklist" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "✓ Checking Node.js version..." -ForegroundColor Yellow
node --version

# Check npm version
Write-Host "✓ Checking npm version..." -ForegroundColor Yellow
npm --version

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

Write-Host ""
Write-Host "🔨 Testing production build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Build output summary:" -ForegroundColor Cyan
    Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum | Select-Object Count, @{Name="Size (MB)";Expression={[math]::Round($_.Sum / 1MB, 2)}}
    Write-Host ""
    Write-Host "🎉 Ready for AWS Amplify deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Push code to your Git repository" -ForegroundColor White
    Write-Host "2. Connect repository to AWS Amplify Console" -ForegroundColor White
    Write-Host "3. Amplify will automatically use amplify.yml configuration" -ForegroundColor White
    Write-Host "4. Monitor build progress in Amplify Console" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}
