#!/bin/bash

# =====================================================
# SSL CERTIFICATE SETUP WITH LET'S ENCRYPT
# =====================================================

set -euo pipefail

# Configuration
DOMAINS=(
    "cargolink.com"
    "www.cargolink.com"
    "api.cargolink.com"
    "admin.cargolink.com"
    "monitoring.cargolink.com"
)

EMAIL="admin@cargolink.com"
NGINX_CONTAINER="cargolink_nginx"
SSL_DIR="/etc/nginx/ssl"
WEBROOT_DIR="/var/www/certbot"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "Bu script root olarak çalıştırılmalıdır"
   exit 1
fi

# Create SSL directory if it doesn't exist
mkdir -p "$SSL_DIR"

# Function to generate self-signed certificates for initial setup
generate_self_signed() {
    local domain=$1
    log_info "Generating self-signed certificate for $domain"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/$domain.key" \
        -out "$SSL_DIR/$domain.crt" \
        -subj "/C=TR/ST=Istanbul/L=Istanbul/O=CargoLink/OU=IT/CN=$domain"
    
    log_success "Self-signed certificate generated for $domain"
}

# Function to obtain Let's Encrypt certificate
obtain_letsencrypt_cert() {
    local domain=$1
    log_info "Obtaining Let's Encrypt certificate for $domain"
    
    # Create webroot directory if it doesn't exist
    mkdir -p "$WEBROOT_DIR"
    
    # Use certbot to obtain certificate
    certbot certonly \
        --webroot \
        --webroot-path="$WEBROOT_DIR" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --staging \
        -d "$domain" \
        --non-interactive
    
    if [ $? -eq 0 ]; then
        log_success "Let's Encrypt certificate obtained for $domain"
        
        # Copy certificates to nginx directory
        cp "/etc/letsencrypt/live/$domain/fullchain.pem" "$SSL_DIR/$domain.crt"
        cp "/etc/letsencrypt/live/$domain/privkey.pem" "$SSL_DIR/$domain.key"
        
        # Set proper permissions
        chown -R nginx:nginx "$SSL_DIR"
        chmod 600 "$SSL_DIR"/*.key
        chmod 644 "$SSL_DIR"/*.crt
        
        log_success "Certificates copied to nginx directory"
    else
        log_error "Failed to obtain Let's Encrypt certificate for $domain"
        return 1
    fi
}

# Function to setup certificate renewal
setup_cert_renewal() {
    log_info "Setting up certificate auto-renewal"
    
    # Create renewal script
    cat > /usr/local/bin/renew-certs.sh << 'EOF'
#!/bin/bash

# Renew certificates
certbot renew --quiet --webroot --webroot-path=/var/www/certbot

# Copy renewed certificates to nginx directory
for domain in cargolink.com api.cargolink.com admin.cargolink.com monitoring.cargolink.com; do
    if [ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
        cp "/etc/letsencrypt/live/$domain/fullchain.pem" "/etc/nginx/ssl/$domain.crt"
        cp "/etc/letsencrypt/live/$domain/privkey.pem" "/etc/nginx/ssl/$domain.key"
    fi
done

# Reload nginx
docker exec cargolink_nginx nginx -s reload

# Log renewal
echo "$(date): Certificates renewed" >> /var/log/cert-renewal.log
EOF

    chmod +x /usr/local/bin/renew-certs.sh
    
    # Add cron job for automatic renewal (runs twice daily)
    (crontab -l 2>/dev/null || true; echo "0 2,14 * * * /usr/local/bin/renew-certs.sh") | crontab -
    
    log_success "Certificate auto-renewal configured"
}

# Function to setup nginx for ACME challenge
setup_nginx_acme() {
    log_info "Setting up nginx for ACME challenge"
    
    # Create temporary nginx config for ACME challenge
    cat > /tmp/nginx-acme.conf << 'EOF'
server {
    listen 80;
    server_name cargolink.com www.cargolink.com api.cargolink.com admin.cargolink.com monitoring.cargolink.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF
    
    # Copy to nginx sites directory
    cp /tmp/nginx-acme.conf /etc/nginx/sites-available/acme-challenge
    ln -sf /etc/nginx/sites-available/acme-challenge /etc/nginx/sites-enabled/
    
    # Test nginx config
    nginx -t
    
    if [ $? -eq 0 ]; then
        log_success "Nginx ACME configuration is valid"
        systemctl reload nginx
    else
        log_error "Nginx ACME configuration is invalid"
        exit 1
    fi
}

# Main execution
main() {
    log_info "Starting SSL certificate setup for CargoLink"
    
    # Check if this is initial setup or renewal
    if [ "${1:-}" == "--initial" ]; then
        log_info "Initial SSL setup mode"
        
        # Generate self-signed certificates first
        for domain in "${DOMAINS[@]}"; do
            generate_self_signed "$domain"
        done
        
        # Setup nginx for ACME challenge
        setup_nginx_acme
        
        # Wait for nginx to be ready
        sleep 5
        
        # Obtain Let's Encrypt certificates
        for domain in "${DOMAINS[@]}"; do
            obtain_letsencrypt_cert "$domain" || true
        done
        
        # Setup auto-renewal
        setup_cert_renewal
        
    elif [ "${1:-}" == "--renew" ]; then
        log_info "Certificate renewal mode"
        
        # Renew all certificates
        certbot renew --quiet --webroot --webroot-path="$WEBROOT_DIR"
        
        # Copy renewed certificates
        for domain in "${DOMAINS[@]}"; do
            if [ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
                cp "/etc/letsencrypt/live/$domain/fullchain.pem" "$SSL_DIR/$domain.crt"
                cp "/etc/letsencrypt/live/$domain/privkey.pem" "$SSL_DIR/$domain.key"
                log_success "Certificate renewed for $domain"
            fi
        done
        
        # Reload nginx
        docker exec "$NGINX_CONTAINER" nginx -s reload
        
    else
        log_error "Usage: $0 [--initial|--renew]"
        log_info "  --initial: Initial SSL setup with self-signed certificates and Let's Encrypt"
        log_info "  --renew: Renew existing Let's Encrypt certificates"
        exit 1
    fi
    
    log_success "SSL certificate setup completed!"
}

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    log_info "Installing certbot..."
    
    if [ -f /etc/debian_version ]; then
        apt-get update
        apt-get install -y certbot
    elif [ -f /etc/redhat-release ]; then
        yum install -y certbot
    else
        log_error "Unsupported operating system"
        exit 1
    fi
    
    log_success "Certbot installed successfully"
fi

# Run main function
main "$@"