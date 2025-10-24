# CargoLink Deployment Guide

Bu dokuman, CargoLink MVP platformunun production ortamına deployment sürecini açıklar.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Docker ve Docker Compose
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Git

### Development Ortamı

```bash
# Repository'i klonlayın
git clone https://github.com/your-username/cargolink-mvp.git
cd cargolink-mvp

# Environment dosyasını oluşturun
cp .env.example .env

# Environment değişkenlerini düzenleyin
nano .env

# Development ortamını başlatın
make quick-start

# Veya manuel olarak:
docker-compose up -d --build
make db-migrate
make db-seed
```

## 🏭 Production Deployment

### 1. Server Hazırlığı

```bash
# Ubuntu/Debian sunucuda
sudo apt update
sudo apt install docker.io docker-compose git

# Docker'ı başlatın
sudo systemctl start docker
sudo systemctl enable docker

# Kullanıcıyı docker grubuna ekleyin
sudo usermod -aG docker $USER
```

### 2. Environment Konfigürasyonu

```bash
# Production environment dosyasını oluşturun
cp .env.example .env.production

# Güvenli değerler ayarlayın:
# - JWT_SECRET: Güçlü rastgele anahtar
# - POSTGRES_PASSWORD: Güçlü veritabanı şifresi
# - Redis şifreleri
# - AWS S3 credentials
# - Payment gateway credentials
```

### 3. Production Deployment

```bash
# Production ortamını başlatın
make prod

# Veya manuel olarak:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 4. SSL Sertifikası Kurulumu

```bash
# Let's Encrypt ile otomatik SSL
sudo apt install certbot
sudo certbot certonly --standalone -d api.cargolink.com.tr -d admin.cargolink.com.tr

# SSL sertifikalarını Docker volume'a kopyalayın
sudo cp /etc/letsencrypt/live/cargolink.com.tr/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/cargolink.com.tr/privkey.pem docker/nginx/ssl/private.key
```

## 📊 Monitoring ve Logging

### Grafana Dashboard

- URL: http://localhost:3000
- Kullanıcı: admin
- Şifre: `${GRAFANA_PASSWORD}` (.env dosyasında)

### Prometheus Metrics

- URL: http://localhost:9090
- Metrics endpoint: http://backend:3001/metrics

### Log Monitoring

```bash
# Tüm servis logları
make logs

# Belirli servis logları
make logs-backend
make logs-admin
make logs-postgres
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Pipeline otomatik olarak şunları yapar:

1. **Test Aşaması**: Unit ve integration testler
2. **Security Scan**: Güvenlik zaafiyetlerini tarar
3. **Build**: Docker image'ları oluşturur
4. **Deploy**: Production'a deploy eder

### Deployment Branches

- `develop` → Staging ortamı
- `main` → Production ortamı

### Secrets Konfigürasyonu

GitHub repository settings → Secrets and variables → Actions:

```
PRODUCTION_HOST=your-production-server-ip
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=your-private-ssh-key
POSTGRES_PASSWORD=your-secure-password
REDIS_PASSWORD=your-redis-password
JWT_SECRET=your-jwt-secret
```

## 🗄️ Database Yönetimi

### Backup

```bash
# Manuel backup
make backup-db

# Otomatik backup (crontab)
0 2 * * * /opt/cargolink/scripts/backup.sh
```

### Restore

```bash
# Backup dosyasından restore
make restore-db BACKUP_FILE=backup.sql
```

### Migrations

```bash
# Production'da migration çalıştır
make db-migrate
```

## 🔒 Güvenlik

### SSL/TLS

- HTTPS zorunlu
- TLS 1.2+ destekli
- SSL sertifikası otomatik yenileme

### Firewall Kuralları

```bash
# Sadece gerekli portları açın
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Güvenlik Taraması

```bash
# Dependency vulnerability scan
npm audit

# Container security scan
docker scan cargolink/backend
```

## 📈 Performance Optimization

### Caching Strategy

- **Redis**: Session ve API cache
- **CDN**: Static asset'ler için
- **Database**: Connection pooling

### Monitoring Metrikleri

- API response time
- Error rate
- Database connection pool
- Memory ve CPU kullanımı
- Disk alanı

## 🚨 Incident Response

### Alerting

Prometheus alertmanager ile otomatik uyarılar:

- API downtime
- Yüksek error rate
- Database bağlantı sorunları
- Yüksek resource kullanımı

### Rollback Procedure

```bash
# Önceki stable release'e geri dön
git checkout tags/v1.0.0
make prod
```

### Health Checks

```bash
# Backend API health
curl http://localhost:3001/health

# Admin panel health  
curl http://localhost:3002/health

# Database health
make shell-postgres
```

## 🔧 Troubleshooting

### Log Analizi

```bash
# Error logları
docker-compose logs --tail=100 backend | grep ERROR

# Database bağlantı sorunları
docker-compose logs postgres | grep connection

# Memory kullanımı
docker stats
```

### Performance Debugging

```bash
# Container resource kullanımı
docker stats cargolink-backend cargolink-admin

# Database slow queries
make shell-postgres
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### Common Issues

#### Port Conflicts

```bash
# Kullanılan portları kontrol et
sudo netstat -tulpn | grep :3001
```

#### Database Connection Issues

```bash
# Database bağlantısını test et
docker-compose exec backend npx prisma db push
```

#### Memory Issues

```bash
# Memory kullanımını optimize et
docker-compose up -d --scale backend=2
```

## 📞 Support

### Monitoring Dashboards

- **Grafana**: System metrics ve alerts
- **Prometheus**: Raw metrics
- **Logs**: Centralized logging

### Team Contacts

- **DevOps**: devops@cargolink.com.tr
- **Backend**: backend@cargolink.com.tr
- **Frontend**: frontend@cargolink.com.tr

---

## 📋 Deployment Checklist

### Pre-deployment

- [ ] Environment dosyaları yapılandırıldı
- [ ] SSL sertifikaları kuruldu
- [ ] Database backup alındı
- [ ] DNS kayıtları güncellendi
- [ ] Firewall kuralları yapılandırıldı

### Post-deployment

- [ ] Health check'ler başarılı
- [ ] Monitoring dashboard'ları çalışıyor
- [ ] SSL sertifikası geçerli
- [ ] Performance test'leri yapıldı
- [ ] Backup stratejisi test edildi

### Production Checklist

- [ ] Load balancer yapılandırıldi
- [ ] CDN aktif
- [ ] Monitoring alerts aktif
- [ ] Log aggregation çalışıyor
- [ ] Backup automation kuruldu
- [ ] Incident response planı hazır