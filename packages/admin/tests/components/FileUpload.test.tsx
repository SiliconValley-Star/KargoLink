import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FileUpload from '../../src/components/upload/FileUpload';

// Mock upload service
jest.mock('../../src/services/upload.service', () => ({
  uploadService: {
    uploadFile: jest.fn(),
    uploadFiles: jest.fn(),
    formatFileSize: jest.fn((bytes: number) => `${bytes} bytes`),
    getMimeTypeFromExtension: jest.fn(() => 'application/octet-stream'),
  },
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('FileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render upload component', () => {
    renderWithTheme(<FileUpload />);
    
    expect(screen.getByText('Dosya Yükleme')).toBeInTheDocument();
    expect(screen.getByText(/Dosyaları buraya sürükleyin/)).toBeInTheDocument();
  });

  it('should display correct file size and type limits', () => {
    renderWithTheme(
      <FileUpload 
        maxSize={5 * 1024 * 1024} // 5MB
        maxFiles={3}
        multiple={true}
      />
    );
    
    expect(screen.getByText(/Maksimum 3 dosya/)).toBeInTheDocument();
    expect(screen.getByText(/5242880 bytes/)).toBeInTheDocument();
  });

  it('should handle single file mode', () => {
    renderWithTheme(<FileUpload multiple={false} />);
    
    expect(screen.getByText(/Tek dosya/)).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithTheme(<FileUpload disabled={true} />);
    
    const uploadArea = screen.getByText(/Dosyaları buraya sürükleyin/).closest('div');
    expect(uploadArea).toHaveStyle('opacity: 0.6');
  });

  it('should show stats when files are added', async () => {
    const mockFiles = [
      new File(['content'], 'test1.txt', { type: 'text/plain' }),
      new File(['content'], 'test2.txt', { type: 'text/plain' }),
    ];

    renderWithTheme(<FileUpload multiple={true} />);
    
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file selection
    Object.defineProperty(input, 'files', {
      value: mockFiles,
      writable: false,
    });
    
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('Bekliyor')).toBeInTheDocument();
      expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
      expect(screen.getByText('Hata')).toBeInTheDocument();
    });
  });

  it('should call onUploadComplete callback', async () => {
    const mockOnUploadComplete = jest.fn();
    const mockUploadService = require('../../src/services/upload.service').uploadService;
    
    mockUploadService.uploadFile.mockResolvedValue({
      key: 'test-key',
      url: 'https://example.com/test.txt',
      size: 100,
      mimeType: 'text/plain',
      originalName: 'test.txt',
    });

    renderWithTheme(
      <FileUpload 
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(input);

    // Wait for file to be added and upload button to appear
    await waitFor(() => {
      expect(screen.getByText('Yükle')).toBeInTheDocument();
    });

    // Click upload button
    fireEvent.click(screen.getByText('Yükle'));

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  it('should call onUploadError callback on error', async () => {
    const mockOnUploadError = jest.fn();
    const mockUploadService = require('../../src/services/upload.service').uploadService;
    
    mockUploadService.uploadFile.mockRejectedValue(new Error('Upload failed'));

    renderWithTheme(
      <FileUpload 
        onUploadError={mockOnUploadError}
      />
    );

    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('Yükle')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Yükle'));

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('Upload failed');
    });
  });

  it('should remove files when delete button is clicked', async () => {
    renderWithTheme(<FileUpload />);

    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });
  });

  it('should handle drag and drop events', () => {
    renderWithTheme(<FileUpload />);
    
    const dropzone = screen.getByText(/Dosyaları buraya sürükleyin/).closest('div') as HTMLElement;
    
    // Test drag enter
    fireEvent.dragEnter(dropzone);
    expect(dropzone).toHaveStyle('border-color: primary.main');
    
    // Test drag leave  
    fireEvent.dragLeave(dropzone);
    expect(dropzone).toHaveStyle('border-color: grey.300');
  });
});