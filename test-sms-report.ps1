# SMS Report Testing Script
# Tests the SMS reporting function with sample messages

Write-Host "=== SMS Report Testing Tool ===" -ForegroundColor Cyan
Write-Host ""

# Get Supabase project URL
$projectUrl = Read-Host "Enter your Supabase project URL (e.g., https://xxxxx.supabase.co)"
if (-not $projectUrl) {
    Write-Host "Error: Project URL is required" -ForegroundColor Red
    exit 1
}

# Remove trailing slash if present
$projectUrl = $projectUrl.TrimEnd('/')

$webhookUrl = "$projectUrl/functions/v1/sms-report"

Write-Host "Using webhook URL: $webhookUrl" -ForegroundColor Green
Write-Host ""

# Test messages
$testMessages = @(
    @{
        name = "Disaster Report - Flood"
        payload = @{
            from = "+94771234567"
            message = "Flood in Colombo near Galle Road. Water level rising fast. About 50 families affected. Need rescue boats and food. My name is Rahul, contact 0771234567"
            sentStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            receivedStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
    },
    @{
        name = "Disaster Report - Fire"
        payload = @{
            from = "+94772345678"
            message = "Building fire at Kandy near railway station. 3 floors burning. Many people trapped inside. Send fire brigade urgently. Contact Sunil 0772345678"
            sentStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            receivedStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
    },
    @{
        name = "Missing Person - Adult"
        payload = @{
            from = "+94773456789"
            message = "My father Amarasena aged 65 is missing since yesterday from Galle Fort area. He has gray hair and was wearing blue shirt. Height 5'6. Please help find him. Contact daughter Nimal 0773456789"
            sentStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            receivedStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
    },
    @{
        name = "Missing Person - Child"
        payload = @{
            from = "+94774567890"
            message = "Lost boy age 8 near Negombo beach. Wearing red t-shirt, blue shorts. Name is Kasun. Last seen 2 hours ago. Mother Chamari calling 0774567890"
            sentStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            receivedStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
    },
    @{
        name = "Animal Rescue - Dog"
        payload = @{
            from = "+94775678901"
            message = "Dog stuck on rooftop at Matara town. Building is flooded. Dog looks injured and scared. Please send animal rescue team. Arun 0775678901"
            sentStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            receivedStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
    },
    @{
        name = "Animal Rescue - Cattle"
        payload = @{
            from = "+94776789012"
            message = "5 cows trapped in flood water near Kurunegala. Water rising. Animals in critical condition. Need urgent rescue. Farmer Banda 0776789012"
            sentStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
            receivedStamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
    }
)

Write-Host "Available test messages:" -ForegroundColor Yellow
for ($i = 0; $i -lt $testMessages.Count; $i++) {
    Write-Host "$($i + 1). $($testMessages[$i].name)" -ForegroundColor Cyan
}
Write-Host "$($testMessages.Count + 1). Send all messages" -ForegroundColor Cyan
Write-Host "0. Exit" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Select a test message (0-$($testMessages.Count + 1))"

if ($choice -eq "0") {
    Write-Host "Exiting..." -ForegroundColor Gray
    exit 0
}

function Send-TestSMS {
    param($message, $name)
    
    Write-Host ""
    Write-Host "=== Testing: $name ===" -ForegroundColor Magenta
    Write-Host "SMS From: $($message.from)" -ForegroundColor Gray
    Write-Host "Message: $($message.message)" -ForegroundColor Gray
    Write-Host ""
    
    $json = $message | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $json -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "SUCCESS" -ForegroundColor Green
        Write-Host "Category: $($response.category)" -ForegroundColor Cyan
        Write-Host "Confidence: $($response.confidence * 100)%" -ForegroundColor Cyan
        Write-Host "Record ID: $($response.record_id)" -ForegroundColor Cyan
        
        if ($response.reply) {
            Write-Host ""
            Write-Host "SMS Reply:" -ForegroundColor Yellow
            Write-Host $response.reply -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "Full Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor DarkGray
        
    }
    catch {
        Write-Host "FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "---------------------------------------------" -ForegroundColor DarkGray
}

if ($choice -eq ($testMessages.Count + 1)) {
    # Send all messages
    Write-Host "Sending all test messages..." -ForegroundColor Yellow
    foreach ($msg in $testMessages) {
        Send-TestSMS -message $msg.payload -name $msg.name
        Start-Sleep -Seconds 2
    }
}
elseif ([int]$choice -ge 1 -and [int]$choice -le $testMessages.Count) {
    # Send selected message
    $selected = $testMessages[[int]$choice - 1]
    Send-TestSMS -message $selected.payload -name $selected.name
}
else {
    Write-Host "Invalid selection" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Green
Write-Host "Check your Supabase dashboard to view the inserted records." -ForegroundColor Cyan
