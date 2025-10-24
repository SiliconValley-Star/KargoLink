import client from '../api/client';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
}

export interface UploadOptions {
  folder?: string;
  generateThumbnail?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

export interface FileData {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

class UploadService {
  /**
   * Tek dosya yükleme
   */
  async uploadFile(file: FileData, options: UploadOptions = {}): Promise<UploadResult> {
    const formData = new FormData();
    
    // React Native için dosya ekleme
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    // Query parametreleri oluştur
    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail) queryParams.append('generateThumbnail', 'true');
    if (options.maxWidth) queryParams.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) queryParams.append('maxHeight', options.maxHeight.toString());
    if (options.quality) queryParams.append('quality', options.quality.toString());

    const url = `/upload/single${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await client.post<{ data: UploadResult }>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    return response.data.data;
  }

  /**
   * Çoklu dosya yükleme
   */
  async uploadFiles(files: FileData[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const formData = new FormData();
    
    // Dosyaları formData'ya ekle
    files.forEach((file) => {
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
    });

    // Query parametreleri oluştur
    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail) queryParams.append('generateThumbnail', 'true');

    const url = `/upload/multiple${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await client.post<{ data: UploadResult[] }>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    return response.data.data;
  }

  /**
   * Avatar yükleme
   */
  async uploadAvatar(file: FileData, options: UploadOptions = {}): Promise<{
    avatarUrl: string;
    thumbnailUrl?: string;
    key: string;
  }> {
    const formData = new FormData();
    
    formData.append('avatar', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    const response = await client.post<{ 
      data: { 
        avatarUrl: string; 
        thumbnailUrl?: string; 
        key: string; 
      } 
    }>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    return response.data.data;
  }

  /**
   * Gönderi için dokuman yükleme
   */
  async uploadDocument(shipmentId: string, file: FileData, options: UploadOptions = {}): Promise<{
    documentUrl: string;
    key: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }> {
    const formData = new FormData();
    
    formData.append('document', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    const response = await client.post<{ 
      data: {
        documentUrl: string;
        key: string;
        fileName: string;
        fileSize: number;
        fileType: string;
      } 
    }>(`/upload/document/${shipmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    return response.data.data;
  }

  /**
   * Resim yükleme (özel işlemli)
   */
  async uploadImage(file: FileData, options: UploadOptions = {}): Promise<UploadResult> {
    const formData = new FormData();
    
    formData.append('image', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail !== false) queryParams.append('generateThumbnail', 'true');
    if (options.maxWidth) queryParams.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) queryParams.append('maxHeight', options.maxHeight.toString());
    if (options.quality) queryParams.append('quality', options.quality.toString());

    const url = `/upload/image${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await client.post<{ data: UploadResult }>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    return response.data.data;
  }

  /**
   * Dosya silme
   */
  async deleteFile(key: string): Promise<void> {
    const encodedKey = encodeURIComponent(key);
    await client.delete(`/upload/file/${encodedKey}`);
  }

  /**
   * Çoklu dosya silme
   */
  async deleteFiles(keys: string[]): Promise<void> {
    await client.delete('/upload/files', {
      data: { keys },
    });
  }

  /**
   * Dosya bilgilerini al
   */
  async getFileInfo(key: string): Promise<{
    key: string;
    size: number;
    lastModified: string;
    contentType: string;
    publicUrl: string;
  }> {
    const encodedKey = encodeURIComponent(key);
    const response = await client.get<{ 
      data: {
        key: string;
        size: number;
        lastModified: string;
        contentType: string;
        publicUrl: string;
      } 
    }>(`/upload/info/${encodedKey}`);
    
    return response.data.data;
  }

  /**
   * Signed URL al
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<{
    key: string;
    signedUrl: string;
    expiresIn: number;
    expiresAt: string;
  }> {
    const encodedKey = encodeURIComponent(key);
    const response = await client.get<{ 
      data: {
        key: string;
        signedUrl: string;
        expiresIn: number;
        expiresAt: string;
      } 
    }>(`/upload/signed-url/${encodedKey}?expiresIn=${expiresIn}`);
    
    return response.data.data;
  }

  /**
   * Upload URL oluştur (presigned upload için)
   */
  async generateUploadUrl(fileName: string, contentType: string, folder?: string, expiresIn: number = 3600): Promise<{
    uploadUrl: string;
    key: string;
    expiresIn: number;
    expiresAt: string;
  }> {
    const queryParams = new URLSearchParams();
    if (folder) queryParams.append('folder', folder);
    if (expiresIn) queryParams.append('expiresIn', expiresIn.toString());

    const url = `/upload/generate-upload-url${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await client.post<{ 
      data: {
        uploadUrl: string;
        key: string;
        expiresIn: number;
        expiresAt: string;
      } 
    }>(url, {
      fileName,
      contentType,
    });
    
    return response.data.data;
  }

  /**
   * File picker helper - React Native için
   */
  async pickImageFromLibrary(): Promise<FileData | null> {
    try {
      // Bu kısım React Native ImagePicker kullanacak
      // Şimdilik placeholder return ediyorum
      const { launchImageLibrary } = require('react-native-image-picker');
      
      return new Promise((resolve) => {
        launchImageLibrary({
          mediaType: 'photo',
          quality: 0.8,
          includeBase64: false,
        }, (response: any) => {
          if (response.didCancel || response.errorMessage) {
            resolve(null);
            return;
          }

          const asset = response.assets?.[0];
          if (asset) {
            resolve({
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || 'image.jpg',
              size: asset.fileSize,
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Image picker error:', error);
      return null;
    }
  }

  /**
   * Camera ile fotoğraf çekme
   */
  async takePhoto(): Promise<FileData | null> {
    try {
      const { launchCamera } = require('react-native-image-picker');
      
      return new Promise((resolve) => {
        launchCamera({
          mediaType: 'photo',
          quality: 0.8,
          includeBase64: false,
        }, (response: any) => {
          if (response.didCancel || response.errorMessage) {
            resolve(null);
            return;
          }

          const asset = response.assets?.[0];
          if (asset) {
            resolve({
              uri: asset.uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || 'photo.jpg',
              size: asset.fileSize,
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }

  /**
   * Document picker helper
   */
  async pickDocument(): Promise<FileData | null> {
    try {
      const DocumentPicker = require('react-native-document-picker');
      
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
      });

      return {
        uri: result.fileCopyUri || result.uri,
        type: result.type || 'application/octet-stream',
        name: result.name,
        size: result.size,
      };
    } catch (error) {
      const DocumentPicker = require('react-native-document-picker');
      if (DocumentPicker.isCancel(error)) {
        return null;
      }
      console.error('Document picker error:', error);
      return null;
    }
  }

  /**
   * Dosya boyutunu formatla
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * MIME type'dan dosya türü belirle
   */
  getFileTypeFromMimeType(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  /**
   * Dosya uzantısından MIME type belirle
   */
  getMimeTypeFromExtension(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      json: 'application/json',
      csv: 'text/csv',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
    };
    
    return mimeTypes[extension || ''] || 'application/octet-stream';
  }
}

export const uploadService = new UploadService();
export default uploadService;