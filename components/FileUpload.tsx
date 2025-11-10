import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the element it's attached to.
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv') {
      setFileName(file.name);
      onFileSelect(file);
    } else {
        alert("Please drop a valid CSV file.");
    }
  }, [onFileSelect, disabled]);

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the element it's attached to.
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the element it's attached to.
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
        setIsDragging(true);
    }
  };

  // FIX: Changed event type from React.DragEvent<HTMLDivElement> to React.DragEvent<HTMLLabelElement> to match the element it's attached to.
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label
        htmlFor="file-upload"
        className={`
          relative block w-full rounded-lg border-2 border-dashed
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'}
          p-12 text-center
          ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'cursor-pointer bg-white dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-500'}
          transition-colors duration-200
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
          {fileName ? fileName : 'Drag & drop a CSV file, or click to upload'}
        </span>
        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
          CSV must contain a 'name' column. Optionally, add an 'imageUrl' column.
        </span>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".csv, text/csv"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};