#!/bin/bash
# CargoLink Database Backup Script

set -e

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cargolink_prod}"
DB_USER="${DB_USER:-cargolink}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/cargolink_backup_$TIMESTAMP.sql"

echo "🗄️  Starting database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "Backup file: $BACKUP_FILE"

# Create database backup
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
   --verbose --clean --no-owner --no-privileges > "$BACKUP_FILE"; then
    echo "✅ Database backup completed successfully"
    
    # Compress the backup file
    echo "📦 Compressing backup file..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    echo "✅ Backup compressed: $BACKUP_FILE"
    
    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
    
else
    echo "❌ Database backup failed"
    exit 1
fi

# Clean up old backups (keep only last N days)
echo "🧹 Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "cargolink_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "✅ Cleanup completed"

# Optional: Upload to cloud storage (AWS S3)
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
    echo "☁️  Uploading backup to AWS S3..."
    S3_KEY="cargolink/backups/$(basename "$BACKUP_FILE")"
    
    if aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BACKUP_BUCKET/$S3_KEY"; then
        echo "✅ Backup uploaded to S3: s3://$AWS_S3_BACKUP_BUCKET/$S3_KEY"
    else
        echo "⚠️  Failed to upload backup to S3"
    fi
fi

# Send notification (optional)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "📢 Sending notification..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ CargoLink database backup completed successfully\\nFile: \`$(basename "$BACKUP_FILE")\`\\nSize: $BACKUP_SIZE\"}" \
        "$SLACK_WEBHOOK_URL"
fi

echo "🎉 Backup process completed!"