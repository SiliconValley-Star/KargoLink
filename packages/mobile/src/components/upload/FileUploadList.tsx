import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import uploadService, { FileData, UploadResult, UploadOptions } from '../../services/upload/upload.service';

export interface UploadedFile extends UploadResult {
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface FileUploadListProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  uploadOptions?: UploadOptions;
  allowedTypes?: 'image' | 'document' | 'all';
  showAddButton?: boolean;
  showProgress?: boolean;
  editable?: boolean;
}

export const FileUploadList: React.FC<FileUploadListProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  uploadOptions = {},
  allowedTypes = 'all',
  showAddButton = true,
  showProgress = true,
  editable = true,
}) => {
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image-outline';
    if (mimeType === 'application/pdf') return 'document-text-outline';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document-outline';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'grid-outline';
    return 'document-outline';
  };

  const handleAddFiles = () => {
    if (isUploading || files.length >= maxFiles) return;

    const options = [
      allowedTypes === 'image' || allowedTypes === 'all' ? 'Galeriden Seç' : null,
      allowedTypes === 'image' || allowedTypes === 'all' ? 'Fotoğraf Çek' : null,
      allowedTypes === 'document' || allowedTypes === 'all' ? 'Dokuman Seç' : null,
      'İptal',
    ].filter(Boolean) as string[];

    Alert.alert(
      'Dosya Ekle',
      'Nasıl bir dosya yüklemek istiyorsunuz?',
      options.map((option) => ({
        text: option,
        onPress: () => handleOptionSelect(option),
        style: option === 'İptal' ? 'cancel' : 'default',
      }))
    );
  };

  const handleOptionSelect = async (option: string) => {
    let fileData: FileData | null = null;

    try {
      setIsUploading(true);

      switch (option) {
        case 'Galeriden Seç':
          fileData = await uploadService.pickImageFromLibrary();
          break;
        case 'Fotoğraf Çek':
          fileData = await uploadService.takePhoto();
          break;
        case 'Dokuman Seç':
          fileData = await uploadService.pickDocument();
          break;
        default:
          return;
      }

      if (!fileData) {
        setIsUploading(false);
        return;
      }

      // Geçici file objesi oluştur
      const tempFile: UploadedFile = {
        id: Date.now().toString(),
        key: '',
        url: '',
        size: fileData.size || 0,
        mimeType: fileData.type,
        originalName: fileData.name,
        status: 'uploading',
        progress: 0,
      };

      // UI'da hemen göster
      const updatedFiles = [...files, tempFile];
      onFilesChange(updatedFiles);

      // Upload işlemi
      const result = await uploadService.uploadFile(fileData, {
        ...uploadOptions,
        onProgress: (progress) => {
          const updatedFilesWithProgress = updatedFiles.map(file =>
            file.id === tempFile.id ? { ...file, progress } : file
          );
          onFilesChange(updatedFilesWithProgress);
        },
      });

      // Başarılı upload sonrası güncelle
      const finalFiles = updatedFiles.map(file =>
        file.id === tempFile.id
          ? {
              ...file,
              ...result,
              status: 'success' as const,
              progress: 100,
            }
          : file
      );
      onFilesChange(finalFiles);

    } catch (error) {
      // Hata durumunda file'ı error status'e geçir
      const errorFiles = files.map(file =>
        file.id === (fileData ? Date.now().toString() : '')
          ? {
              ...file,
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Upload failed',
            }
          : file
      );
      onFilesChange(errorFiles);
      
      const errorMessage = error instanceof Error ? error.message : 'Dosya yükleme hatası';
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    if (!editable) return;

    Alert.alert(
      'Dosyayı Sil',
      'Bu dosyayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const updatedFiles = files.filter(file => file.id !== fileId);
            onFilesChange(updatedFiles);
          },
        },
      ]
    );
  };

  const renderFileItem = ({ item }: { item: UploadedFile }) => (
    <View style={[styles.fileItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.fileInfo}>
        {item.mimeType.startsWith('image/') && item.url ? (
          <Image source={{ uri: item.thumbnailUrl || item.url }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.fileIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <Ionicons
              name={getFileIcon(item.mimeType) as any}
              size={24}
              color={theme.colors.primary}
            />
          </View>
        )}

        <View style={styles.fileDetails}>
          <Text style={[styles.fileName, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {item.originalName}
          </Text>
          <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
            {formatFileSize(item.size)}
          </Text>

          {showProgress && item.status === 'uploading' && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: theme.colors.primary, width: `${item.progress || 0}%` }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                {item.progress || 0}%
              </Text>
            </View>
          )}

          {item.status === 'error' && (
            <Text style={[styles.errorText, { color: theme.colors.error }]} numberOfLines={2}>
              {item.error}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.fileActions}>
        {item.status === 'uploading' && (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        )}
        
        {item.status === 'success' && (
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
        )}
        
        {item.status === 'error' && (
          <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
        )}

        {editable && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFile(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cloud-upload-outline" size={48} color={theme.colors.onSurfaceVariant} />
      <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
        Henüz dosya yüklenmedi
      </Text>
    </View>
  );

  const renderAddButton = () => {
    if (!showAddButton || !editable || files.length >= maxFiles) return null;

    return (
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={handleAddFiles}
        disabled={isUploading}
      >
        <Ionicons
          name={isUploading ? "hourglass-outline" : "add-outline"}
          size={24}
          color={theme.colors.primary}
        />
        <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
          {isUploading ? 'Yükleniyor...' : 'Dosya Ekle'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {files.length > 0 ? (
        <FlatList
          data={files}
          renderItem={renderFileItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

      {renderAddButton()}

      {files.length > 0 && (
        <Text style={[styles.fileCount, { color: theme.colors.onSurfaceVariant }]}>
          {files.length}/{maxFiles} dosya
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    minWidth: 35,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    marginLeft: 12,
    padding: 4,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  fileCount: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default FileUploadList;