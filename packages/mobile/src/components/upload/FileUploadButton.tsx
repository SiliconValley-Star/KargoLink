import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import uploadService, { FileData, UploadResult, UploadOptions } from '../../services/upload/upload.service';

export interface FileUploadButtonProps {
  onUpload?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  uploadOptions?: UploadOptions;
  buttonText?: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  acceptedTypes?: 'image' | 'document' | 'all';
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onUpload,
  onError,
  uploadOptions = {},
  buttonText = 'Dosya Yükle',
  icon = 'cloud-upload-outline',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  acceptedTypes = 'all',
}) => {
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);

  const showPicker = () => {
    if (disabled || isUploading) return;

    const options = [
      acceptedTypes === 'image' || acceptedTypes === 'all' ? 'Galeriden Seç' : null,
      acceptedTypes === 'image' || acceptedTypes === 'all' ? 'Fotoğraf Çek' : null,
      acceptedTypes === 'document' || acceptedTypes === 'all' ? 'Dokuman Seç' : null,
      'İptal',
    ].filter(Boolean) as string[];

    Alert.alert(
      'Dosya Seç',
      'Nasıl bir dosya yüklemek istiyorsunuz?',
      options.map((option, index) => ({
        text: option,
        onPress: () => handleOptionSelect(option),
        style: option === 'İptal' ? 'cancel' : 'default',
      }))
    );
  };

  const handleOptionSelect = async (option: string) => {
    let file: FileData | null = null;

    try {
      setIsUploading(true);

      switch (option) {
        case 'Galeriden Seç':
          file = await uploadService.pickImageFromLibrary();
          break;
        case 'Fotoğraf Çek':
          file = await uploadService.takePhoto();
          break;
        case 'Dokuman Seç':
          file = await uploadService.pickDocument();
          break;
        default:
          return;
      }

      if (!file) {
        setIsUploading(false);
        return;
      }

      const result = await uploadService.uploadFile(file, {
        ...uploadOptions,
        onProgress: (progress) => {
          // Progress callback can be handled here if needed
          console.log('Upload progress:', progress);
        },
      });

      onUpload?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Dosya yükleme hatası';
      onError?.(errorMessage);
      Alert.alert('Hata', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`]];
    
    switch (variant) {
      case 'primary':
        return [
          ...baseStyle,
          { backgroundColor: theme.colors.primary },
          disabled && { backgroundColor: theme.colors.surface, opacity: 0.6 },
        ];
      case 'secondary':
        return [
          ...baseStyle,
          { backgroundColor: theme.colors.secondary },
          disabled && { backgroundColor: theme.colors.surface, opacity: 0.6 },
        ];
      case 'outline':
        return [
          ...baseStyle,
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.primary
          },
          disabled && { borderColor: theme.colors.surface, opacity: 0.6 },
        ];
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.onSurface + '80';
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.onPrimary;
      case 'outline':
        return theme.colors.primary;
      default:
        return theme.colors.onPrimary;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={showPicker}
      disabled={disabled || isUploading}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {isUploading ? (
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <Ionicons
            name={icon as any}
            size={getIconSize()}
            color={getTextColor()}
            style={styles.buttonIcon}
          />
        )}
        <Text style={[styles.buttonText, { color: getTextColor() }]}>
          {isUploading ? 'Yükleniyor...' : buttonText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FileUploadButton;