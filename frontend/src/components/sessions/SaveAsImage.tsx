'use client';

import React, { useState, RefObject } from 'react';
import { toPng } from 'html-to-image';

interface SaveAsImageProps {
  containerRef: RefObject<HTMLDivElement | null>;
  sessionName?: string;
}

const SaveAsImage: React.FC<SaveAsImageProps> = ({ containerRef, sessionName }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!containerRef.current) return;
    
    setIsExporting(true);
    try {
      // Capture the element as a PNG
      const dataUrl = await toPng(containerRef.current, {
        cacheBust: true,
        backgroundColor: '#1a1612', // Match the app's dark background variable --bg-primary
        style: {
          borderRadius: '0',
          margin: '0',
          padding: '20px' // Add some padding to the saved image for branding look
        }
      });
      
      const link = document.createElement('a');
      const fileName = sessionName 
        ? `حسبة_${sessionName.replace(/\s+/g, '_')}.png` 
        : `حسبة_عالنوتة.png`;
        
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error sharing as image:', error);
      alert('حصلت مشكلة في الصورة، جرب تاني');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="save-image-btn"
    >
      <span className="export-icon">📸</span>
      {isExporting ? 'بنصور...' : 'شير كصورة'}
    </button>
  );
};

export default SaveAsImage;
