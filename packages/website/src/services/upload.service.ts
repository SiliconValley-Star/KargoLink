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
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  /**
   * Single file upload
   */
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    // Query parameters
    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail) queryParams.append('generateThumbnail', 'true');
    if (options.maxWidth) queryParams.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) queryParams.append('maxHeight', options.maxHeight.toString());
    if (options.quality) queryParams.append('quality', options.quality.toString());

    const url = `${this.apiUrl}/upload/single${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it for multipart/form-data
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Multiple files upload
   */
  async uploadFiles(files: File[], options: UploadOptions = {}): Promise<UploadResult[]> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Query parameters
    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail) queryParams.append('generateThumbnail', 'true');

    const url = `${this.apiUrl}/upload/multiple${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Avatar upload
   */
  async uploadAvatar(file: File): Promise<{
    avatarUrl: string;
    thumbnailUrl?: string;
    key: string;
  }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.apiUrl}/upload/avatar`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Avatar upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Document upload for shipment
   */
  async uploadDocument(shipmentId: string, file: File): Promise<{
    documentUrl: string;
    key: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${this.apiUrl}/upload/document/${shipmentId}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Document upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Image upload with processing
   */
  async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('image', file);

    const queryParams = new URLSearchParams();
    if (options.folder) queryParams.append('folder', options.folder);
    if (options.generateThumbnail !== false) queryParams.append('generateThumbnail', 'true');
    if (options.maxWidth) queryParams.append('maxWidth', options.maxWidth.toString());
    if (options.maxHeight) queryParams.append('maxHeight', options.maxHeight.toString());
    if (options.quality) queryParams.append('quality', options.quality.toString());

    const url = `${this.apiUrl}/upload/image${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Image upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete file
   */
  async deleteFile(key: string): Promise<void> {
    const encodedKey = encodeURIComponent(key);
    const response = await fetch(`${this.apiUrl}/upload/file/${encodedKey}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(keys: string[]): Promise<void> {
    const response = await fetch(`${this.apiUrl}/upload/files`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keys }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Bulk delete failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(key: string): Promise<{
    key: string;
    size: number;
    lastModified: string;
    contentType: string;
    publicUrl: string;
  }> {
    const encodedKey = encodeURIComponent(key);
    const response = await fetch(`${this.apiUrl}/upload/info/${encodedKey}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get file info' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get signed URL for file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<{
    key: string;
    signedUrl: string;
    expiresIn: number;
    expiresAt: string;
  }> {
    const encodedKey = encodeURIComponent(key);
    const response = await fetch(`${this.apiUrl}/upload/signed-url/${encodedKey}?expiresIn=${expiresIn}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get signed URL' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Generate presigned upload URL
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

    const url = `${this.apiUrl}/upload/generate-upload-url${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate upload URL' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Upload with progress tracking
   */
  async uploadWithProgress(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      // Query parameters
      const queryParams = new URLSearchParams();
      if (options.folder) queryParams.append('folder', options.folder);
      if (options.generateThumbnail) queryParams.append('generateThumbnail', 'true');
      if (options.maxWidth) queryParams.append('maxWidth', options.maxWidth.toString());
      if (options.maxHeight) queryParams.append('maxHeight', options.maxHeight.toString());
      if (options.quality) queryParams.append('quality', options.quality.toString());

      const url = `${this.apiUrl}/upload/single${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && options.onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          options.onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.data);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', url);
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): { valid: boolean; error?: string } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [],
      allowedExtensions = [],
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(maxSize)} limit`,
      };
    }

    // Check MIME type
    if (allowedTypes.length > 0) {
      const isValidType = allowedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.replace('*', '');
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isValidType) {
        return {
          valid: false,
          error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
        };
      }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type from MIME type
   */
  getFileType(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  /**
   * Get MIME type from file extension
   */
  getMimeType(fileName: string): string {
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