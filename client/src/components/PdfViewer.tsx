'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { getPdfUrl } from '@/utils/pdfUtils';

interface PdfViewerProps {
  pdfPath: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const PdfViewer = ({ pdfPath, isOpen, onClose, title = 'PDF Document' }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // signed URL (from your getPdfUrl) and optionally fetched ArrayBuffer
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);

  // measure container width for responsive Page rendering
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);

  // Set pdf worker on client only (react-pdf recommends this)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url,
      ).toString();
    }
  }, []);

  // load signed URL and try to fetch ArrayBuffer (falls back to using URL)
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    // reset when closed
    if (!isOpen) {
      setSignedUrl(null);
      setPdfArrayBuffer(null);
      setNumPages(0);
      setPageNumber(1);
      setLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      if (!pdfPath) return;
      setLoading(true);
      setError(null);
      setPdfArrayBuffer(null);
      setSignedUrl(null);

      try {
        const url = await getPdfUrl(pdfPath);
        if (!mounted) return;
        setSignedUrl(url);

        // Try to fetch the PDF bytes (ArrayBuffer). This lets PDF.js read the file
        // without doing its own cross-origin URL fetch which can fail due to CORS.
        try {
          const res = await fetch(url, { signal: controller.signal, mode: 'cors' });
          if (!mounted) return;
          if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/pdf') || contentType === '') {
            const arrayBuffer = await res.arrayBuffer();
            if (!mounted) return;
            setPdfArrayBuffer(arrayBuffer);
          } else {
            console.warn('PDF fetch returned non-pdf content-type:', contentType, '— falling back to URL');
          }
        } catch (fetchErr) {
          console.warn('Fetching PDF as ArrayBuffer failed; falling back to using the URL directly.', fetchErr);
        }
      } catch (err: any) {
        console.error('Failed to get signed PDF URL:', err);
        if (!mounted) return;
        setError('Failed to load PDF document');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [isOpen, pdfPath]);

  // Use ResizeObserver to keep Page width in sync with container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => setPageWidth(Math.max(200, el.clientWidth - 32));
    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [isOpen]);

  const onDocumentLoadSuccess = (pdf: PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('react-pdf load error:', err);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const goToPrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setPageNumber((p) => Math.min(p + 1, numPages));
  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  // Download: if we have arrayBuffer, make a blob and download; else use signedUrl
  const handleDownload = async () => {
    try {
      if (pdfArrayBuffer) {
        const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }

      const url = signedUrl ?? (await getPdfUrl(pdfPath));
      if (!url) throw new Error('No PDF URL available for download');
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Download failed:', err);
      setError('Download failed');
    }
  };

  // Prepare file prop for react-pdf
  const fileProp = pdfArrayBuffer ? { data: pdfArrayBuffer } : signedUrl ? { url: signedUrl } : null;

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Controls */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">Page {pageNumber} of {numPages || '--'}</span>

              <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="text-sm">{Math.round(scale * 100)}%</span>

              <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3.0}>
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                <span className="ml-2">Download</span>
              </Button>
            </div>
          </div>

          {/* PDF Content */}
          <div ref={containerRef} className="flex-1 overflow-auto flex justify-center bg-gray-100 p-4">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading PDF...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-600">{error}</p>
                  <Button variant="outline" onClick={handleDownload} className="mt-2">Try downloading instead</Button>
                </div>
              </div>
            )}

            {!loading && !error && fileProp && (
              <Document
                key={`${signedUrl ?? ''}-${pdfArrayBuffer ? 'buf' : 'url'}`}
                file={fileProp}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
              >
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth ? Math.round(pageWidth * scale) : undefined}
                  scale={!pageWidth ? scale : undefined}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
