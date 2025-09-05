# Deployment Guide - Doctor Appointment Management System

## Overview
This guide covers deployment options for the Doctor Appointment Management System API, including local development, staging, and production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- .NET 8.0 SDK or Runtime
- MongoDB 4.4+
- Windows Server 2019+ / Ubuntu 20.04+ / CentOS 8+
- Minimum 2GB RAM, 10GB disk space
- Internet connectivity for package downloads

### Development Tools
- Visual Studio 2022 / VS Code
- MongoDB Compass (optional)
- Postman for API testing
- Git for version control

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd DoctorAppointmentAPI
```

### 2. Install Dependencies
```bash
dotnet restore
```

### 3. Setup MongoDB
```bash
# Install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# Ubuntu: 
sudo apt-get install mongodb

# Start MongoDB service
# Windows: Start MongoDB service from Services
# Ubuntu:
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4. Configure Application Settings
```json
// appsettings.Development.json
{
  "ConnectionStrings": {
    "MongoDB": "mongodb://localhost:27017/DoctorAppointmentDB"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### 5. Run Application
```bash
dotnet run
# or
dotnet watch run  # for hot reload during development
```

### 6. Verify Installation
- API: http://localhost:5289/index.html
- Health Check: http://localhost:5289/api/health (if implemented)

## Production Deployment

### Option 1: Self-Contained Deployment

#### 1. Publish Application
```bash
# For Windows Server
dotnet publish -c Release -r win-x64 --self-contained true -o ./publish

# For Linux Server
dotnet publish -c Release -r linux-x64 --self-contained true -o ./publish
```

#### 2. Copy Files to Server
```bash
# Copy publish folder to server
scp -r ./publish user@server:/var/www/doctorappointmentapi
```

#### 3. Configure Production Settings
```json
// appsettings.Production.json
{
  "ConnectionStrings": {
    "MongoDB": "mongodb://production-mongo-server:27017/DoctorAppointmentDB"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "yourdomain.com,www.yourdomain.com"
}
```

#### 4. Setup as Windows Service
```xml
<!-- Create DoctorAppointmentAPI.exe.config -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <runtime>
    <gcServer enabled="true"/>
  </runtime>
</configuration>
```

```bash
# Install as Windows Service
sc create DoctorAppointmentAPI binPath="C:\path\to\DoctorAppointmentAPI.exe"
sc start DoctorAppointmentAPI
```

#### 5. Setup as Linux Service
```ini
# Create /etc/systemd/system/doctorappointmentapi.service
[Unit]
Description=Doctor Appointment API
After=network.target

[Service]
Type=notify
ExecStart=/var/www/doctorappointmentapi/DoctorAppointmentAPI
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable doctorappointmentapi
sudo systemctl start doctorappointmentapi
sudo systemctl status doctorappointmentapi
```

### Option 2: Framework-Dependent Deployment

#### 1. Install .NET Runtime on Server
```bash
# Ubuntu
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y aspnetcore-runtime-8.0

# Windows: Download from https://dotnet.microsoft.com/download
```

#### 2. Publish Application
```bash
dotnet publish -c Release -o ./publish
```

#### 3. Deploy and Run
```bash
# Copy files to server
scp -r ./publish user@server:/var/www/doctorappointmentapi

# Run application
cd /var/www/doctorappointmentapi
dotnet DoctorAppointmentAPI.dll
```

## Docker Deployment

### 1. Create Dockerfile
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["DoctorAppointmentAPI.csproj", "."]
RUN dotnet restore "./DoctorAppointmentAPI.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "DoctorAppointmentAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DoctorAppointmentAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DoctorAppointmentAPI.dll"]
```

### 2. Create Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8080:80"
      - "8443:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__MongoDB=mongodb://mongo:27017/DoctorAppointmentDB
    depends_on:
      - mongo
    networks:
      - doctorapp-network

  mongo:
    image: mongo:7.0
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your-secure-password
      MONGO_INITDB_DATABASE: DoctorAppointmentDB
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - doctorapp-network

volumes:
  mongo-data:

networks:
  doctorapp-network:
    driver: bridge
```

### 3. MongoDB Initialization Script
```javascript
// mongo-init.js
db = db.getSiblingDB('DoctorAppointmentDB');

// Create collections
db.createCollection('Users');
db.createCollection('Doctors');
db.createCollection('Specialties');
db.createCollection('Appointments');

// Create indexes for performance
db.Users.createIndex({ "email": 1 }, { unique: true });
db.Doctors.createIndex({ "userId": 1 }, { unique: true });
db.Doctors.createIndex({ "specialtyId": 1 });
db.Appointments.createIndex({ "doctorId": 1 });
db.Appointments.createIndex({ "patientId": 1 });
db.Appointments.createIndex({ "appointmentDate": 1 });

print("Database initialized successfully");
```

### 4. Build and Run
```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## Cloud Deployment

### Azure App Service

#### 1. Create Azure Resources
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login and set subscription
az login
az account set --subscription "your-subscription-id"

# Create resource group
az group create --name rg-doctorapp --location eastus

# Create App Service plan
az appservice plan create --name asp-doctorapp --resource-group rg-doctorapp --sku B1 --is-linux

# Create web app
az webapp create --resource-group rg-doctorapp --plan asp-doctorapp --name doctorapp-api --runtime "DOTNETCORE|8.0"
```

#### 2. Configure Connection String
```bash
az webapp config connection-string set --resource-group rg-doctorapp --name doctorapp-api --connection-string-type custom --settings MongoDB="mongodb://your-mongo-connection-string"
```

#### 3. Deploy Application
```bash
# Method 1: ZIP deployment
dotnet publish -c Release -o ./publish
cd publish
zip -r ../app.zip .
az webapp deployment source config-zip --resource-group rg-doctorapp --name doctorapp-api --src ../app.zip

# Method 2: GitHub Actions (see below)
```

### AWS Elastic Beanstalk

#### 1. Install EB CLI
```bash
pip install awsebcli
```

#### 2. Initialize Application
```bash
eb init doctorapp-api --platform "64bit Amazon Linux 2 v2.2.0 running .NET Core" --region us-east-1
```

#### 3. Create Environment
```bash
eb create production --database.engine postgres --database.username admin
```

#### 4. Deploy
```bash
dotnet publish -c Release -o ./aws-deployment
eb deploy
```

### GitHub Actions CI/CD

#### 1. Create Workflow File
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
        
    - name: Restore dependencies
      run: dotnet restore
      
    - name: Build
      run: dotnet build --no-restore -c Release
      
    - name: Test
      run: dotnet test --no-build --verbosity normal
      
    - name: Publish
      run: dotnet publish -c Release -o ./publish
      
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'doctorapp-api'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: './publish'
```

## Environment Configuration

### Production Configuration
```json
{
  "ConnectionStrings": {
    "MongoDB": "mongodb://prod-server:27017/DoctorAppointmentDB"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:80"
      },
      "Https": {
        "Url": "https://0.0.0.0:443",
        "Certificate": {
          "Path": "/path/to/certificate.pfx",
          "Password": "certificate-password"
        }
      }
    }
  }
}
```

### Environment Variables
```bash
# Set environment variables
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__MongoDB="mongodb://server:27017/DoctorAppointmentDB"
export ASPNETCORE_URLS="http://0.0.0.0:80;https://0.0.0.0:443"
```

## Reverse Proxy Setup

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/doctorapp-api
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Apache Configuration
```apache
# /etc/apache2/sites-available/doctorapp-api.conf
<VirtualHost *:80>
    ServerName api.yourdomain.com
    Redirect permanent / https://api.yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName api.yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /path/to/ssl/certificate.crt
    SSLCertificateKeyFile /path/to/ssl/private.key
    
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:5000/
    ProxyPassReverse / http://127.0.0.1:5000/
    
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

## SSL Certificate Setup

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate
```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Convert to PFX for .NET
openssl pkcs12 -export -out certificate.pfx -inkey key.pem -in cert.pem
```

## Monitoring and Logging

### Application Insights (Azure)
```json
{
  "ApplicationInsights": {
    "InstrumentationKey": "your-instrumentation-key"
  }
}
```

### Serilog Configuration
```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.File", "Serilog.Sinks.Console"],
    "MinimumLevel": "Information",
    "WriteTo": [
      {
        "Name": "File",
        "Args": {
          "path": "/var/log/doctorapp/api-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30
        }
      },
      {
        "Name": "Console"
      }
    ]
  }
}
```

### Health Checks
```csharp
// Add to Program.cs
builder.Services.AddHealthChecks()
    .AddMongoDb(connectionString: "mongodb://localhost:27017/DoctorAppointmentDB");

app.MapHealthChecks("/health");
```

## Backup and Recovery

### MongoDB Backup Script
```bash
#!/bin/bash
# backup-mongodb.sh

BACKUP_DIR="/backups/mongodb"
DB_NAME="DoctorAppointmentDB"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --db $DB_NAME --out $BACKUP_FILE

# Compress backup
tar -czf "$BACKUP_FILE.tar.gz" -C $BACKUP_DIR "backup_$DATE"
rm -rf $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.tar.gz"
```

### Automated Backup with Cron
```bash
# Add to crontab
0 2 * * * /path/to/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
```

### Recovery Process
```bash
# Extract backup
tar -xzf backup_20250909_020000.tar.gz

# Restore database
mongorestore --db DoctorAppointmentDB --drop backup_20250909_020000/DoctorAppointmentDB/
```

## Security Considerations

### 1. Network Security
```bash
# Configure firewall (Ubuntu/CentOS)
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw deny 27017/tcp # Block direct MongoDB access
```

### 2. MongoDB Security
```javascript
// Enable authentication
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

// Connection string with authentication
mongodb://admin:secure-password@localhost:27017/DoctorAppointmentDB?authSource=admin
```

### 3. Application Security Headers
```csharp
// Add to Program.cs
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});
```

### 4. Rate Limiting
```csharp
// Install AspNetCoreRateLimit package
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 100
        }
    };
});
```

## Performance Optimization

### 1. MongoDB Indexes
```javascript
// Create indexes for better performance
db.Users.createIndex({ "email": 1 }, { unique: true })
db.Doctors.createIndex({ "userId": 1 }, { unique: true })
db.Doctors.createIndex({ "specialtyId": 1 })
db.Doctors.createIndex({ "isApproved": 1 })
db.Appointments.createIndex({ "doctorId": 1, "appointmentDate": 1 })
db.Appointments.createIndex({ "patientId": 1, "status": 1 })
db.Appointments.createIndex({ "status": 1, "appointmentDate": 1 })
```

### 2. Application Caching
```csharp
// Add memory caching
builder.Services.AddMemoryCache();

// In service layer
public async Task<List<SpecialtyDto>> GetAllSpecialtiesAsync()
{
    const string cacheKey = "all_specialties";
    
    if (!_cache.TryGetValue(cacheKey, out List<SpecialtyDto> specialties))
    {
        // Load from database
        specialties = await LoadSpecialtiesFromDatabase();
        
        // Cache for 30 minutes
        _cache.Set(cacheKey, specialties, TimeSpan.FromMinutes(30));
    }
    
    return specialties;
}
```

### 3. Connection Pooling
```json
{
  "ConnectionStrings": {
    "MongoDB": "mongodb://localhost:27017/DoctorAppointmentDB?maxPoolSize=50&minPoolSize=5"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
journalctl -u doctorappointmentapi -f

# Check port binding
netstat -tlnp | grep :80
ss -tlnp | grep :80

# Check file permissions
ls -la /var/www/doctorappointmentapi/
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
mongo --host localhost --port 27017

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Verify connection string
echo $ConnectionStrings__MongoDB
```

#### 3. SSL/Certificate Issues
```bash
# Test SSL certificate
openssl s_client -connect api.yourdomain.com:443

# Check certificate expiry
openssl x509 -in certificate.crt -text -noout | grep "Not After"

# Verify certificate chain
curl -I https://api.yourdomain.com
```

#### 4. Performance Issues
```bash
# Monitor system resources
htop
iostat -x 1
free -h

# MongoDB performance
db.currentOp()
db.serverStatus()
```

### Log Analysis
```bash
# Application logs
tail -f /var/log/doctorapp/api-*.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -xe
```

## Maintenance

### Regular Tasks
1. **Daily**: Monitor application logs and system resources
2. **Weekly**: Review security logs and update dependencies
3. **Monthly**: Database maintenance and backup verification
4. **Quarterly**: Security patches and performance review

### Update Process
```bash
# 1. Backup current version
cp -r /var/www/doctorappointmentapi /var/www/doctorappointmentapi.backup

# 2. Build new version
dotnet publish -c Release -o ./publish

# 3. Stop service
sudo systemctl stop doctorappointmentapi

# 4. Deploy new version
rsync -av ./publish/ /var/www/doctorappointmentapi/

# 5. Start service
sudo systemctl start doctorappointmentapi

# 6. Verify deployment
curl -I https://api.yourdomain.com/swagger
```

This deployment guide covers all major deployment scenarios and should help you successfully deploy the Doctor Appointment Management System in any environment.
