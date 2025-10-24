import axios from 'axios';

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

class UploadService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Tek dosya yükleme
   */
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    // Query parametreleri oluştur
    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail) queryParams.append('generateThumbnail', 'true');
    if (options.maxWidth) queryParams.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) queryParams.append('maxHeight', options.maxHeight.toString());
    if (options.quality) queryParams.append('quality', options.quality.toString());

    const url = `${this.baseURL}/api/upload/single${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await axios.post<{ data: UploadResult }>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeaders(),
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
  async uploadFiles(files: File[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const formData = new FormData();
    
    // Dosyaları formData'ya ekle
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Query parametreleri oluştur
    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail) queryParams.append('generateThumbnail', 'true');

    const url = `${this.baseURL}/api/upload/multiple${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await axios.post<{ data: UploadResult[] }>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeaders(),
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
  async uploadAvatar(file: File, options: UploadOptions = {}): Promise<{
    avatarUrl: string;
    thumbnailUrl?: string;
    key: string;
  }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post<{ 
      data: { 
        avatarUrl: string; 
        thumbnailUrl?: string; 
        key: string; 
      } 
    }>(`${this.baseURL}/api/upload/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...this.getAuthHeaders(),
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
    await axios.delete(`${this.baseURL}/api/upload/file/${encodedKey}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Çoklu dosya silme
   */
  async deleteFiles(keys: string[]): Promise<void> {
    await axios.delete(`${this.baseURL}/api/upload/files`, {
      data: { keys },
      headers: this.getAuthHeaders(),
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
    const response = await axios.get<{ 
      data: {
        key: string;
        size: number;
        lastModified: string;
        contentType: string;
        publicUrl: string;
      } 
    }>(`${this.baseURL}/api/upload/info/${encodedKey}`, {
      headers: this.getAuthHeaders(),
    });
    
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
    const response = await axios.get<{ 
      data: {
        key: string;
        signedUrl: string;
        expiresIn: number;
        expiresAt: string;
      } 
    }>(`${this.baseURL}/api/upload/signed-url/${encodedKey}?expiresIn=${expiresIn}`, {
      headers: this.getAuthHeaders(),
    });
    
    return response.data.data;
  }

  /**
   * Upload URL oluştur
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

    const url = `${this.baseURL}/api/upload/generate-upload-url${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await axios.post<{ 
      data: {
        uploadUrl: string;
        key: string;
        expiresIn: number;
        expiresAt: string;
      } 
    }>(url, {
      fileName,
      contentType,
    }, {
      headers: this.getAuthHeaders(),
    });
    
    return response.data.data;
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