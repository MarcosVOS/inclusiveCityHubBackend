# ===================================================================================
# Script de Teste de Integração da API (VERSÃO FINAL E CORRIGIDA)
# ===================================================================================

# --- Configuração ---
$baseUrl = 'http://localhost:8080'

# ===================================================================================
# FUNÇÕES AUXILIARES
# ===================================================================================
function Safe-Invoke-Request {
  param(
    [ValidateSet('GET', 'POST', 'PUT', 'DELETE')]
    [string]$Method,
    [string]$Uri,
    [object]$Body = $null,
    [hashtable]$Headers = @{}
  )
  try {
    $invokeParams = @{ Uri = $Uri; Method = $Method; Headers = $Headers; ErrorAction = 'Stop' }
    if ($Body -ne $null) {
      $invokeParams.Body = ($Body | ConvertTo-Json -Depth 5)
      $invokeParams.ContentType = 'application/json'
    }
    return Invoke-RestMethod @invokeParams
  } catch {
    $exception = $_.Exception
    Write-Host "ERRO: A requisição falhou para $Method $Uri" -ForegroundColor Red
    if ($exception.Response) {
      $statusCode = [int]$exception.Response.StatusCode
      Write-Host "  -> Código de Status: $statusCode" -ForegroundColor Yellow
      try {
        $responseStream = $exception.Response.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($responseStream)
        $errorBody = $streamReader.ReadToEnd(); $streamReader.Close()
        Write-Host "  -> Corpo da Resposta:" -ForegroundColor Cyan; Write-Host $errorBody
      } catch { Write-Host "  -> Não foi possível ler o corpo da resposta de erro: $($_.Exception.Message)" -ForegroundColor Red }
    } else { Write-Host "  -> Exceção: $($exception.Message)" -ForegroundColor Red }
    return $null
  }
}
function Show-Result {
  param([string]$StepName, [object]$Result)
  Write-Host "--> Resultado para '$StepName':"
  if ($Result) { Write-Host ($Result | ConvertTo-Json -Depth 5) -ForegroundColor Gray }
  else { Write-Host "<FALHA - Nenhum objeto de resposta retornado>" -ForegroundColor Red }
  Write-Host
}

# ===================================================================================
# EXECUÇÃO DO SCRIPT
# ===================================================================================

Write-Host "== Iniciando testes da API em $baseUrl ==" -ForegroundColor Magenta

# --- 1. SETUP ---
$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$commonUserEmail = "common+$timestamp@test.local"
$enterpriseEmail = "enterprise+$timestamp@test.local"
$uniqueSeconds = (Get-Date -Format 'ss'); $cnpjCheckDigit = [int]$uniqueSeconds + 10
$cnpj = "99.999.999/0001-$cnpjCheckDigit"
$password = 'aVeryStrongP@ssw0rd!'
$authToken, $commonUserId, $enterpriseUserId, $categoryId = $null

# --- 2. Criar Usuário Comum ---
Write-Host "`n== PASSO 2: Criar um usuário 'common' ==" -ForegroundColor Green
$userBody = @{ email = $commonUserEmail; password = $password; user_type = 'common' }
$createdUser = Safe-Invoke-Request -Method 'POST' -Uri "$baseUrl/users" -Body $userBody
Show-Result -StepName "POST /users (common)" -Result $createdUser
if ($createdUser) { $commonUserId = $createdUser.id }

# --- 3. Criar Usuário Empresa ---
Write-Host "`n== PASSO 3: Criar um usuário 'enterprise' ==" -ForegroundColor Green
$enterpriseBody = @{ email = $enterpriseEmail; password = $password; user_type = 'enterprise'; cnpj = $cnpj }
$createdEnterprise = Safe-Invoke-Request -Method 'POST' -Uri "$baseUrl/users" -Body $enterpriseBody
Show-Result -StepName "POST /users (enterprise)" -Result $createdEnterprise
if ($createdEnterprise) { $enterpriseUserId = $createdEnterprise.id }

# --- 4. Testar Criação de Usuário Duplicado ---
Write-Host "`n== PASSO 4: Tentar criar um usuário duplicado (erro esperado) ==" -ForegroundColor Yellow
$duplicateBody = @{ email = $commonUserEmail; password = 'anotherpassword'; user_type = 'common' }
Safe-Invoke-Request -Method 'POST' -Uri "$baseUrl/users" -Body $duplicateBody

# --- 5. Listar Todos os Usuários ---
Write-Host "`n== PASSO 5: Listar todos os usuários ==" -ForegroundColor Green
$allUsers = Safe-Invoke-Request -Method 'GET' -Uri "$baseUrl/users"
Show-Result -StepName "GET /users" -Result $allUsers

# --- 6. Obter ID da Primeira Categoria Disponível ---
Write-Host "`n== PASSO 6: Obter lista de categorias ==" -ForegroundColor Green
# O Invoke-RestMethod desempacota a resposta { "value": [...] } automaticamente.
# A variável $categories recebe a lista de categorias diretamente.
$categories = @(Safe-Invoke-Request -Method 'GET' -Uri "$baseUrl/categories")
Show-Result -StepName "GET /categories" -Result $categories
if ($categories -and $categories.Count -gt 0) {
    # <<< ESTA É A CORREÇÃO FINAL E DEFINITIVA
    # Garante que pegamos o ID apenas do primeiro item [0] da lista
    $categoryId = $categories[0].id
    
    Write-Host "-> Usando o ID de Categoria para os testes: $categoryId" -ForegroundColor Cyan
} else {
    Write-Host "-> Nenhuma categoria encontrada. A criação de eventos será pulada." -ForegroundColor Red
}
# --- 7. Autenticar como Usuário Empresa ---
Write-Host "`n== PASSO 7: Autenticar como o usuário enterprise ==" -ForegroundColor Green
if ($enterpriseUserId) {
    $loginBody = @{ email = $enterpriseEmail; password = $password }
    $loginResponse = Safe-Invoke-Request -Method 'POST' -Uri "$baseUrl/sessions" -Body $loginBody
    Show-Result -StepName "POST /sessions" -Result $loginResponse
    if ($loginResponse.token) {
        $authToken = $loginResponse.token
        Write-Host "-> Login bem-sucedido. Token capturado." -ForegroundColor Cyan
    } else { Write-Host "-> Login falhou ou o token não foi encontrado na resposta." -ForegroundColor Red }
} else { Write-Host "-> Pulando login: O usuário enterprise não foi criado com sucesso." -ForegroundColor Yellow }

# --- 8. Criar um Evento (Autenticado) ---
Write-Host "`n== PASSO 8: Criar um novo evento ==" -ForegroundColor Green
if ($authToken -and $categoryId -and $enterpriseUserId) {
    $authHeaders = @{ Authorization = "Bearer $authToken" }
    $eventBody = @{
        enterprise_id = $enterpriseUserId
        category_id = $categoryId
        name        = "Tech Summit $timestamp"
        description = "Um evento de tecnologia incrível criado via script automatizado."
        # <<< CORREÇÃO APLICADA: Usa 'event_date' para corresponder ao banco de dados
        event_date  = (Get-Date).AddMonths(6).ToString("u").Replace(" ", "T")
        location    = "Online"
    }
    $createdEvent = Safe-Invoke-Request -Method 'POST' -Uri "$baseUrl/events" -Body $eventBody -Headers $authHeaders
    Show-Result -StepName "POST /events" -Result $createdEvent
} else {
    Write-Host "-> Pulando criação de evento: Faltando token de autenticação, ID da categoria ou ID da empresa." -ForegroundColor Yellow
}

# --- 9. Listar Todos os Eventos ---
Write-Host "`n== PASSO 9: Listar todos os eventos ==" -ForegroundColor Green
$allEvents = Safe-Invoke-Request -Method 'GET' -Uri "$baseUrl/events/approved"
Show-Result -StepName "GET /events/approved" -Result $allEvents

# --- 10. LIMPEZA ---
Write-Host "`n== PASSO 10: Limpeza e teste dos endpoints restantes de usuário ==" -ForegroundColor Green
if ($commonUserId) {
    Write-Host "--> Testando GET /users/$commonUserId" -ForegroundColor Cyan
    $userById = Safe-Invoke-Request -Method 'GET' -Uri "$baseUrl/users/$commonUserId"
    Show-Result -StepName "GET /users/{id}" -Result $userById
    Write-Host "--> Testando PUT /users/$commonUserId" -ForegroundColor Cyan
    $updateBody = @{ email = "updated+$timestamp@test.local" }
    $updatedUser = Safe-Invoke-Request -Method 'PUT' -Uri "$baseUrl/users/$commonUserId" -Body $updateBody
    Show-Result -StepName "PUT /users/{id}" -Result $updatedUser
    Write-Host "--> Testando DELETE /users/$commonUserId" -ForegroundColor Cyan
    Safe-Invoke-Request -Method 'DELETE' -Uri "$baseUrl/users/$commonUserId"
    Write-Host "--> Requisição DELETE enviada. Verifique os logs do servidor para confirmação."
} else { Write-Host "-> Pulando limpeza: O ID do usuário comum não foi capturado." -ForegroundColor Yellow }

# --- 11. Salvar Dados Gerados ---
Write-Host "`n== PASSO 11: Salvando dados gerados em arquivo ==" -ForegroundColor Green
$outputData = @{
    created_common_user_id   = $commonUserId
    created_enterprise_id    = $enterpriseUserId
    used_category_id         = $categoryId
    enterprise_auth_token    = $authToken
}
$outputJson = $outputData | ConvertTo-Json -Depth 5
$outputFilePath = Join-Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) "last_run_ids.json"
$outputJson | Out-File -FilePath $outputFilePath -Encoding UTF8
Write-Host "-> IDs e token salvos com sucesso em: $outputFilePath" -ForegroundColor Cyan
Write-Host $outputJson -ForegroundColor Gray

Write-Host "`n== Testes finalizados. ==" -ForegroundColor Magenta
