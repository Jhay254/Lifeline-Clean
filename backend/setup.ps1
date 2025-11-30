# Load .env file and set environment variables
Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    if ($line -and !$line.StartsWith('#')) {
        if ($line -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim() -replace '^"|"$', ''
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
            Write-Host "Set $name = $value"
        }
    }
}

Write-Host "`nEnvironment variables set. DATABASE_URL is: $env:DATABASE_URL`n"

Write-Host "Running Prisma db push...`n"
npx prisma db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Database schema created successfully!`n"
    
    Write-Host "Generating Prisma Client...`n"
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Prisma Client generated successfully!`n"
        Write-Host "✅ Setup complete! You can now run: npm run dev"
    }
} else {
    Write-Host "`n❌ Setup failed"
    exit 1
}
