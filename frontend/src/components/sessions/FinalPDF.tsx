'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/services/apiClient';

interface FinalPDFProps {
  sessionId: string;
  token?: string | null;
}

const FinalPDF: React.FC<FinalPDFProps> = ({ sessionId, token }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const endpoint = token 
        ? `/api/sessions/${sessionId}/export/pdf?viewerToken=${token}`
        : `/api/sessions/${sessionId}/export/pdf`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error('فشل تحميل PDF');
      }

      const blob = await response.blob();
      const url2 = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url2;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = 'فاتورة-الحسابة.pdf';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = decodeURIComponent(fileNameMatch[1]);
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url2);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('حصلت مشكلة في التحميل، جرب تاني');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="export-pdf-btn"
    >
      <span className="export-icon">📄</span>
      {isExporting ? 'بننزل...' : 'تحميل PDF'}
    </button>
  );
};

export default FinalPDF;