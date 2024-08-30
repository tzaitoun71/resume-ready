'use client';

import React, { useState } from 'react';
import { PDFDocumentProxy, getDocument } from 'pdfjs-dist';

const PdfUploader: React.FC = () => {
  const [pdfText, setPdfText] = useState<string>('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await getDocument(typedarray).promise;
      let textContent = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item: any) => item.str).join(' ');
      }

      setPdfText(textContent);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {pdfText && (
        <div>
          <h3>Extracted Text:</h3>
          <p>{pdfText}</p>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
