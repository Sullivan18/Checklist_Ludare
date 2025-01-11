# Salvar o branch atual
$currentBranch = git rev-parse --abbrev-ref HEAD

# Limpar diretórios de build
Write-Host "🧹 Limpando diretórios de build..." -ForegroundColor Yellow
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Construir o projeto
Write-Host "🏗️ Construindo o projeto..." -ForegroundColor Yellow
npm run build

# Verificar se o build foi bem sucedido
if (-not (Test-Path "dist")) {
    Write-Host "❌ Erro: Falha ao gerar o build!" -ForegroundColor Red
    exit 1
}

# Criar arquivo 404.html
Write-Host "📝 Criando arquivo 404.html..." -ForegroundColor Yellow
Copy-Item -Path "dist/index.html" -Destination "dist/404.html"

# Mudar para o branch gh-pages
Write-Host "🔄 Mudando para branch gh-pages..." -ForegroundColor Yellow
git checkout gh-pages
if ($LASTEXITCODE -ne 0) {
    git checkout -b gh-pages
}

# Limpar arquivos antigos
Write-Host "🧹 Limpando arquivos antigos..." -ForegroundColor Yellow
Get-ChildItem -Path . -Exclude .git,node_modules,dist | Remove-Item -Recurse -Force

# Copiar arquivos do build
Write-Host "📋 Copiando arquivos do build..." -ForegroundColor Yellow
Copy-Item -Path "dist/*" -Destination "." -Recurse -Force

# Criar arquivo .nojekyll
Write-Host "📝 Criando arquivo .nojekyll..." -ForegroundColor Yellow
New-Item -ItemType File -Path ".nojekyll" -Force

# Adicionar alterações ao git
Write-Host "📝 Adicionando alterações ao git..." -ForegroundColor Yellow
git add .
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Forçar push para o branch gh-pages
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Yellow
git push origin gh-pages -f

# Voltar para o branch original
Write-Host "↩️ Voltando para o branch $currentBranch..." -ForegroundColor Yellow
git checkout $currentBranch

Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green 