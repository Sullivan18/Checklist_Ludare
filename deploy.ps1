# Salvar a branch atual
$currentBranch = git rev-parse --abbrev-ref HEAD

# Construir o projeto
Write-Host "Construindo o projeto..." -ForegroundColor Yellow
npm run build

# Verificar se a build foi bem sucedida
if (-not (Test-Path "dist")) {
    Write-Host "Erro: A pasta dist nao foi criada!" -ForegroundColor Red
    exit 1
}

# Mudar para a branch gh-pages
Write-Host "Mudando para branch gh-pages..." -ForegroundColor Yellow
git checkout gh-pages
if ($LASTEXITCODE -ne 0) {
    git checkout -b gh-pages
}

# Limpar arquivos antigos
Write-Host "Limpando arquivos antigos..." -ForegroundColor Yellow
Remove-Item -Path "assets" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "index.html" -Force -ErrorAction SilentlyContinue

# Copiar arquivos da build
Write-Host "Copiando arquivos novos..." -ForegroundColor Yellow
Copy-Item -Path "dist/*" -Destination "." -Recurse -Force

# Adicionar arquivos ao git
Write-Host "Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .

# Criar commit
Write-Host "Criando commit..." -ForegroundColor Yellow
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# Forçar push para gh-pages
Write-Host "Fazendo push para gh-pages..." -ForegroundColor Yellow
git push origin gh-pages -f

# Voltar para a branch original
Write-Host "Voltando para branch $currentBranch..." -ForegroundColor Yellow
git checkout $currentBranch

Write-Host "Deploy concluido!" -ForegroundColor Green 