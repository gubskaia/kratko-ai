import { useState } from 'react';
import { Upload, FileText, File, FileCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
}

export function UploadZone({ onFileUpload }: UploadZoneProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 shadow-lg'
            : 'border-border bg-card hover:border-primary/50 hover:bg-card/80'
        }`}
      >
        <div className="p-16 flex flex-col items-center justify-center gap-6">
          <div className={`p-6 rounded-2xl transition-all duration-300 ${
            isDragging
              ? 'bg-primary/10'
              : 'bg-secondary'
          }`}>
            <Upload className={`w-12 h-12 transition-colors duration-300 ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>

          <div className="text-center">
            <h3 className="text-white dark:text-white text-foreground font-['Inter'] mb-2">
              {t('dropDocument')}
            </h3>
            <p className="text-white/50 dark:text-white/50 text-muted-foreground font-['Inter']" style={{ fontSize: '0.875rem' }}>
              {t('orClickBrowse')}
            </p>
          </div>

          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-5 h-5" />
              <span className="font-['Inter']" style={{ fontSize: '0.875rem' }}>PDF</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <File className="w-5 h-5" />
              <span className="font-['Inter']" style={{ fontSize: '0.875rem' }}>DOCX</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileCheck className="w-5 h-5" />
              <span className="font-['Inter']" style={{ fontSize: '0.875rem' }}>TXT</span>
            </div>
          </div>

          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
