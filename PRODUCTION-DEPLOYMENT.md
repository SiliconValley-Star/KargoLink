# 🚀 CargoLink Production Deployment Guide

Bu rehber CargoLink MVP'nin production ortamına deployment'ını adım adım açıklar.

## 🔧 Ön Gereksinimler

### Sistem Gereksinimleri
- **CPU**: 4 vCPU (minimum), 8 vCPU (önerilen)
- **RAM**: 8GB (minimum), 16GB (önerilen)  
- **Disk**: 50GB SSD (minimum), 100GB SSD (önerilen)
- **OS**: Ubuntu 20.04 LTS / CentOS 8 / RHEL 8

### Yazılım Gereksinimleri
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- SSL sertifikası (Let's Encrypt otomatik kurulum)

## 📋 Deployment Adımları

### 1. Sunucu Hazırlığı

```bash
# Sistemi güncelle
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Proje Kurulumu

```bash
# Proje deposunu klonla
git clone https://github.com/your-org/cargolink.git
cd cargolink

# Production branch'ine geç
git checkout production

# Environment dosyasını konfigüre et
cp .env.production .env
```

### 3. SSL Sertifikası Kurulumu

```bash
# SSL setup script'ini çalıştır
sudo chmod +x docker/scripts/ssl-setup.sh
sudo ./docker/scripts/ssl-setup.sh --initial
```

### 4. Production Deployment

```bash
# Deployment script'ini çalıştır  
chmod +x docker/scripts/deploy.sh
./docker/scripts/deploy.sh deploy
```

### 5. Deployment Doğrulama

```bash
# Servis durumunu kontrol et
./docker/scripts/deploy.sh status

# Health check'leri çalıştır
./docker/scripts/deploy.sh health
```

## 🌐 Servis URL'leri

### Production URL'leri
- **Ana Website**: https://cargolink.com
- **Admin Panel**: https://admin.cargolink.com  
- **API**: https://api.cargolink.com
- **Monitoring**: https://monitoring.cargolink.com

### API Endpoint'leri
- **Health Check**: `GET https://api.cargolink.com/health`
- **Detailed Health**: `GET https://api.cargolink.com/health/detailed`
- **Metrics**: `GET https://api.cargolink.com/metrics`
- **API Documentation**: `GET https://api.cargolink.com/`

## 📊 Monitoring ve Metrikleri

### Grafana Dashboards
- **System Overview**: CPU, Memory, Disk kullanımı
- **Application Metrics**: Request rates, response times, error rates
- **Database Metrics**: Connection pools, query performance
- **Business Metrics**: Shipment counts, user activity, revenue

### Prometheus Metrikleri
- `cargolink_uptime_seconds`: Uygulama uptime
- `cargolink_memory_usage_percent`: Memory kullanım yüzdesi
- `cargolink_total_shipments`: Toplam gönderi sayısı
- `cargolink_total_users`: Toplam kullanıcı sayısı

### Log Yönetimi
- **Backend Logs**: `/var/log/cargolink/backend.log`
- **Website Logs**: `/var/log/cargolink/website.log`
- **NGINX Logs**: `/var/log/nginx/cargolink.log`
- **Database Logs**: Docker logs ile erişilebilir

## 🔐 Güvenlik Konfigürasyonu

### SSL/HTTPS
- Let's Encrypt ile otomatik sertifika yenileme
- HSTS header'ları aktif
- SSL Labs A+ rating

### Security Headers
- `Content-Security-Policy`
- `X-Frame-Options`  
- `X-XSS-Protection`
- `X-Content-Type-Options`
- `Referrer-Policy`

### Rate Limiting
- Genel API: 1000 request/15dk
- Login endpoint: 10 request/15dk
- Payment API: 100 request/15dk

## 🗄️ Database Yönetimi

### Backup Stratejisi
```bash
# Manuel backup
docker exec cargolink_postgres pg_dump -U postgres cargolink_prod > backup_$(date +%Y%m%d).sql

# Otomatik backup (cron ile)
# Her gece 02:00'da backup alınır
0 2 * * * /path/to/backup-script.sh
```

### Migration'lar
```bash
# Production migration'ları çalıştır
docker compose -f docker-compose.website.yml exec backend npm run migrate:prod
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
- **Push to main**: Development deployment
- **Push to production**: Production deployment
- **Pull request**: Test suite ve security scan

### Deployment Stratejisi
- **Zero-downtime deployment**
- **Health check based rollout**
- **Automatic rollback on failure**

## 🛠️ Maintenance Komutları

### Servis Yönetimi
```bash
# Tüm servisleri başlat
docker compose -f docker-compose.website.yml up -d

# Tüm servisleri durdur
docker compose -f docker-compose.website.yml down

# Logları izle
docker compose -f docker-compose.website.yml logs -f [service_name]

# Servis restart
docker compose -f docker-compose.website.yml restart [service_name]
```

### Performance Optimizasyonu
```bash
# Docker container'ları temizle
docker system prune -af

# Image'ları güncelle
docker compose -f docker-compose.website.yml pull

# Volume'ları temizle (dikkatli kullanın)
docker volume prune -f
```

## 📱 Mobile App Konfigürasyonu

### Deep Link Configuration
- **Scheme**: `cargolink://`
- **Universal Links**: `https://app.cargolink.com/*`

### Push Notification
- **FCM Configuration**: Firebase console'dan yapılandırılmış
- **APNs Configuration**: Apple Developer Portal'dan yapılandırılmış

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### SSL Sertifikası Yenilenmedi
```bash
# Manuel yenileme
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

#### Database Connection Hatası
```bash
# PostgreSQL container'ını kontrol et
docker compose logs postgres

# Connection string'i kontrol et
echo $DATABASE_URL
```

#### High Memory Usage
```bash
# Memory kullanımını kontrol et
docker stats

# Problematic container'ı restart et
docker compose restart [service_name]
```

#### API Response Yavaş
```bash
# Response time'ları kontrol et
curl -w "@curl-format.txt" -s https://api.cargolink.com/health

# Database query performance
docker compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Emergency Procedures

#### Complete System Rollback
```bash
# Son bilinen working version'a rollback
./docker/scripts/deploy.sh rollback

# Database backup'ından restore
# (Backup prosedürlerini takip edin)
```

#### Service-Specific Issues
```bash
# Backend servisini restart
docker compose restart backend

# Database maintenance mode
docker compose exec postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='cargolink_prod';"
```

## 🎯 Performance Benchmarks

### Target Metrics
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms (95th percentile)  
- **Database Query Time**: < 100ms (average)
- **Uptime**: 99.9%

### Load Testing
```bash
# API load test
k6 run tests/load/api-load-test.js

# Website load test  
lighthouse https://cargolink.com --output html
```

## 📧 Support ve İletişim

### Teknik Destek
- **Email**: tech-support@cargolink.com
- **Slack**: #cargolink-ops
- **On-call**: +90 XXX XXX XXXX

### Monitoring Alerts
- **High Error Rate**: > 5%
- **High Response Time**: > 1000ms
- **Low Disk Space**: < 20%
- **High Memory Usage**: > 85%

## 📚 Ek Kaynaklar

- [API Documentation](https://docs.cargolink.com/api)
- [Architecture Overview](./ARCHITECTURE.md)
- [Security Guidelines](./SECURITY.md)
- [Monitoring Setup](./MONITORING.md)

---

**Son Güncelleme**: 2024-10-25  
**Deployment Version**: v1.0.0  
**Maintained By**: CargoLink DevOps Team