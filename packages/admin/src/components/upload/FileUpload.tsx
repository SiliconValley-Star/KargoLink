import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Grid,
  Paper,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image,
  VideoFile,
  AudioFile,
  PictureAsPdf,
  CheckCircle,
  Error as ErrorIcon,
  Upload,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { uploadService, UploadResult, UploadOptions } from '../../services/upload.service';

// File status için enum
enum FileStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading', 
  COMPLETED = 'completed',
  ERROR = 'error',
}

// File with progress interface
interface FileWithProgress {
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
  result?: UploadResult;
}

// Props interface
interface FileUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // bytes
  accept?: Record<string, string[]>;
  disabled?: boolean;
  folder?: string;
  generateThumbnail?: boolean;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
}

// Default accept types
const defaultAccept = {
  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
  'text/csv': ['.csv'],
};

const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = defaultAccept,
  disabled = false,
  folder,
  generateThumbnail = false,
  onUploadComplete,
  onUploadError,
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // Dosya ekleme
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithProgress[] = acceptedFiles.map(file => ({
      file,
      status: FileStatus.PENDING,
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Upload işlemi
  const uploadFile = useCallback(async (fileIndex: number) => {
    const fileWithProgress = files[fileIndex];
    if (!fileWithProgress || fileWithProgress.status !== FileStatus.PENDING) return;

    // Status'u uploading yap
    setFiles(prev => prev.map((f, i) => 
      i === fileIndex ? { ...f, status: FileStatus.UPLOADING, progress: 0 } : f
    ));

    try {
      const options: UploadOptions = {
        folder,
        generateThumbnail,
        onProgress: (progress) => {
          setFiles(prev => prev.map((f, i) => 
            i === fileIndex ? { ...f, progress } : f
          ));
        }
      };

      const result = await uploadService.uploadFile(fileWithProgress.file, options);

      // Upload tamamlandı
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { ...f, status: FileStatus.COMPLETED, progress: 100, result }
          : f
      ));

      // Callback çağır
      if (onUploadComplete) {
        const completedResults = files
          .filter((f, i) => i === fileIndex || f.status === FileStatus.COMPLETED)
          .map(f => f.result!)
          .filter(Boolean);
        onUploadComplete(completedResults);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setFiles(prev => prev.map((f, i) => 
        i === fileIndex 
          ? { ...f, status: FileStatus.ERROR, error: errorMessage }
          : f
      ));

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  }, [files, folder, generateThumbnail, onUploadComplete, onUploadError]);

  // Tüm pending dosyaları upload et
  const uploadAllFiles = useCallback(async () => {
    const pendingIndices = files
      .map((f, index) => f.status === FileStatus.PENDING ? index : -1)
      .filter(index => index !== -1);

    for (const index of pendingIndices) {
      await uploadFile(index);
    }
  }, [files, uploadFile]);

  // Dosya silme
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Dropzone config
  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles: multiple ? maxFiles : 1,
    maxSize,
    multiple,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  // File type'a göre ikon
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image color="primary" />;
    if (type.startsWith('video/')) return <VideoFile color="secondary" />;
    if (type.startsWith('audio/')) return <AudioFile color="info" />;
    if (type.includes('pdf')) return <PictureAsPdf color="error" />;
    return <InsertDriveFile />;
  };

  // Status'a göre ikon
  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case FileStatus.COMPLETED:
        return <CheckCircle color="success" />;
      case FileStatus.ERROR:
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  // File size formatı
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Stats
  const pendingFiles = files.filter(f => f.status === FileStatus.PENDING).length;
  const completedFiles = files.filter(f => f.status === FileStatus.COMPLETED).length;
  const errorFiles = files.filter(f => f.status === FileStatus.ERROR).length;

  // Accept edilen uzantıları göster
  const extensions = Object.values(accept).flat();

  return (
    <Card>
      <CardHeader 
        title="Dosya Yükleme"
        action={
          pendingFiles > 0 && (
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={uploadAllFiles}
              disabled={disabled}
            >
              Tümünü Yükle ({pendingFiles})
            </Button>
          )
        }
      />
      
      <CardContent>
        {/* Drop Zone */}
        <Paper
          {...getRootProps()}
          elevation={isDragActive ? 4 : 1}
          sx={{
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: isDragActive ? 'primary.main' : 
                        isDragReject ? 'error.main' : 'grey.300',
            backgroundColor: isDragActive ? 'primary.light' : 
                           isDragReject ? 'error.light' : 'transparent',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          <input {...getInputProps()} />
          
          <CloudUpload 
            sx={{ 
              fontSize: 48, 
              color: isDragActive ? 'primary.main' : 'grey.400',
              mb: 2 
            }} 
          />
          
          <Typography variant="h6" gutterBottom>
            {isDragActive 
              ? 'Dosyaları bırakın...' 
              : 'Dosyaları buraya sürükleyin veya tıklayın'
            }
          </Typography>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {multiple ? `Maksimum ${maxFiles} dosya` : 'Tek dosya'} • 
            Maksimum {formatFileSize(maxSize)} • 
            {extensions.length > 0 && (
              <Chip 
                size="small" 
                label={extensions.join(', ')} 
                variant="outlined" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Paper>

        {/* Drag reject warning */}
        {isDragReject && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Bu dosya türleri kabul edilmiyor veya dosya çok büyük.
          </Alert>
        )}

        {/* Stats */}
        {files.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {pendingFiles}
                </Typography>
                <Typography variant="body2">
                  Bekliyor
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {completedFiles}
                </Typography>
                <Typography variant="body2">
                  Tamamlandı
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {errorFiles}
                </Typography>
                <Typography variant="body2">
                  Hata
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* File List */}
        {files.length > 0 && (
          <List sx={{ mt: 2 }}>
            {files.map((fileWithProgress, index) => (
              <ListItem key={`${fileWithProgress.file.name}-${index}`} divider>
                <ListItemIcon>
                  {getFileIcon(fileWithProgress.file)}
                </ListItemIcon>
                
                <ListItemText
                  primary={fileWithProgress.file.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        {formatFileSize(fileWithProgress.file.size)}
                      </Typography>
                      
                      {fileWithProgress.status === FileStatus.UPLOADING && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={fileWithProgress.progress} 
                          />
                          <Typography variant="caption">
                            {fileWithProgress.progress}%
                          </Typography>
                        </Box>
                      )}
                      
                      {fileWithProgress.status === FileStatus.ERROR && (
                        <Typography variant="caption" color="error">
                          {fileWithProgress.error}
                        </Typography>
                      )}
                      
                      {fileWithProgress.status === FileStatus.COMPLETED && fileWithProgress.result && (
                        <Typography variant="caption" color="success.main">
                          Yüklendi: {fileWithProgress.result.url}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(fileWithProgress.status)}
                    
                    {fileWithProgress.status === FileStatus.PENDING && (
                      <Button
                        size="small"
                        onClick={() => uploadFile(index)}
                        disabled={disabled}
                      >
                        Yükle
                      </Button>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => removeFile(index)}
                      disabled={disabled || fileWithProgress.status === FileStatus.UPLOADING}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;