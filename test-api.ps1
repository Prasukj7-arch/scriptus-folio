Write-Host "🧪 COMPREHENSIVE BACKEND API TESTING" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
    Write-Host "✅ Health Check: SUCCESS" -ForegroundColor Green
    Write-Host $health.Content
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: Get Books (Empty)
Write-Host "`n2. Testing Get Books (Empty Database)..." -ForegroundColor Yellow
try {
    $books = Invoke-WebRequest -Uri "http://localhost:5000/api/books" -UseBasicParsing
    Write-Host "✅ Get Books: SUCCESS" -ForegroundColor Green
    Write-Host $books.Content
} catch {
    Write-Host "❌ Get Books: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 3: User Registration
Write-Host "`n3. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Prasuk Jain"
    email = "prasukjain200005@gmail.com"
    password = "testpassword123"
} | ConvertTo-Json

try {
    $register = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerData -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ User Registration: SUCCESS" -ForegroundColor Green
    Write-Host $register.Content
    $registerResponse = $register.Content | ConvertFrom-Json
    $token = $registerResponse.token
} catch {
    Write-Host "❌ User Registration: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 4: User Login
Write-Host "`n4. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = "prasukjain200005@gmail.com"
    password = "testpassword123"
} | ConvertTo-Json

try {
    $login = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ User Login: SUCCESS" -ForegroundColor Green
    Write-Host $login.Content
    $loginResponse = $login.Content | ConvertFrom-Json
    $token = $loginResponse.token
} catch {
    Write-Host "❌ User Login: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 5: Create Book (if we have token)
if ($token) {
    Write-Host "`n5. Testing Create Book..." -ForegroundColor Yellow
    $bookData = @{
        title = "Test Book"
        author = "Test Author"
        description = "This is a test book description"
        genre = "Fiction"
        publishedYear = 2023
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    try {
        $book = Invoke-WebRequest -Uri "http://localhost:5000/api/books" -Method POST -Body $bookData -Headers $headers -UseBasicParsing
        Write-Host "✅ Create Book: SUCCESS" -ForegroundColor Green
        Write-Host $book.Content
    } catch {
        Write-Host "❌ Create Book: FAILED" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

# Test 6: Get Books (After Creating)
Write-Host "`n6. Testing Get Books (After Creating)..." -ForegroundColor Yellow
try {
    $booksAfter = Invoke-WebRequest -Uri "http://localhost:5000/api/books" -UseBasicParsing
    Write-Host "✅ Get Books After Creation: SUCCESS" -ForegroundColor Green
    Write-Host $booksAfter.Content
} catch {
    Write-Host "❌ Get Books After Creation: FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n🎉 BACKEND TESTING COMPLETED!" -ForegroundColor Green
