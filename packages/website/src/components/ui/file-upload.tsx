"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Progress } from '@/components/ui/progress';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  key?: string;
  thumbnailUrl?: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface FileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  uploadEndpoint?: string;
  onUpload?: (files: File[]) => Promise<UploadedFile[]>;
  placeholder?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  disabled = false,
  className,
  showPreview = true,
  uploadEndpoint = '/api/upload',
  onUpload,
  placeholder = "Dosyaları sürükleyip bırakın veya seçmek için tıklayın",
  variant = 'default'
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validation
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        console.error(`File ${file.name} is too large`);
        return false;
      }
      
      const isValidType = acceptedFileTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.replace('*', '');
          return file.type.startsWith(baseType);
        }
        return file.type === type || file.name.toLowerCase().endsWith(type);
      });
      
      if (!isValidType) {
        console.error(`File ${file.name} has invalid type`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Check max files limit
    if (value.length + validFiles.length > maxFiles) {
      console.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);

    try {
      let uploadedFiles: UploadedFile[] = [];

      if (onUpload) {
        uploadedFiles = await onUpload(validFiles);
      } else {
        // Default upload implementation
        uploadedFiles = await Promise.all(
          validFiles.map(async (file, index) => {
            const id = `${Date.now()}-${index}`;
            const tempFile: UploadedFile = {
              id,
              name: file.name,
              size: file.size,
              type: file.type,
              status: 'uploading',
              progress: 0
            };

            try {
              const formData = new FormData();
              formData.append('file', file);

              const response = await fetch(`${uploadEndpoint}/single`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
              });

              if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
              }

              const result = await response.json();
              
              return {
                ...tempFile,
                status: 'success' as const,
                progress: 100,
                url: result.data.url,
                key: result.data.key,
                thumbnailUrl: result.data.thumbnailUrl
              };
            } catch (error) {
              return {
                ...tempFile,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed'
              };
            }
          })
        );
      }

      onChange?.([...value, ...uploadedFiles]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange, maxFiles, maxSize, acceptedFileTypes, uploadEndpoint, onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragging) {
      setIsDragging(true);
    }
  }, [disabled, isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragging to false if we're leaving the drop zone itself
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const removeFile = useCallback((fileId: string) => {
    onChange?.(value.filter(file => file.id !== fileId));
  }, [value, onChange]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  if (variant === 'minimal') {
    return (
      <div className={cn("space-y-2", className)}>
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedFileTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Dosya Seç
            </>
          )}
        </Button>

        {value.length > 0 && (
          <div className="space-y-1">
            {value.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-500 hover:text-red-500 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedFileTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-primary hover:bg-primary/5",
          isDragging && "border-primary bg-primary/10",
          disabled && "opacity-50 cursor-not-allowed",
          variant === 'compact' && "p-4"
        )}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "p-4 bg-gray-100 dark:bg-gray-800 rounded-full",
            variant === 'compact' && "p-2"
          )}>
            {isUploading ? (
              <Loader2 className={cn("w-8 h-8 animate-spin text-primary", variant === 'compact' && "w-6 h-6")} />
            ) : (
              <Upload className={cn("w-8 h-8 text-gray-400", variant === 'compact' && "w-6 h-6")} />
            )}
          </div>
          
          <div className="space-y-2">
            <p className={cn("text-lg font-medium text-gray-900 dark:text-gray-100", variant === 'compact' && "text-base")}>
              {isUploading ? 'Dosyalar yükleniyor...' : placeholder}
            </p>
            <p className={cn("text-sm text-gray-500", variant === 'compact' && "text-xs")}>
              Maksimum {maxFiles} dosya, her biri {formatFileSize(maxSize)} boyutunda
            </p>
            <p className={cn("text-xs text-gray-400", variant === 'compact' && "hidden")}>
              Desteklenen formatlar: {acceptedFileTypes.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {showPreview && value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Yüklenen Dosyalar ({value.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {value.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {file.status === 'uploading' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  ) : file.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                {file.thumbnailUrl && file.type.startsWith('image/') ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <Progress value={file.progress} className="mt-1 h-1" />
                  )}
                  
                  {file.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}