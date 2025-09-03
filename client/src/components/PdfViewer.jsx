'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { getPdfUrl } from '@/utils/pdfUtils';

export const PdfViewer = ({ pdfPath, isOpen, onClose, title = 'PDF Document' }) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // signed URL (from your getPdfUrl) and optionally fetched ArrayBuffer
  const [signedUrl, setSignedUrl] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);

  // measure container width for responsive Page rendering
  const containerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(undefined);

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
      setPageNumber(1);
      setScale(1.0);
      return;
    }

    const loadPdf = async () => {
      if (!pdfPath) {
        setError('No PDF path provided');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get the signed URL
        const url = await getPdfUrl(pdfPath);
        if (!mounted) return;
        
        setSignedUrl(url);
        
        // Try to fetch the PDF as ArrayBuffer for better handling
        try {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const arrayBuffer = await response.arrayBuffer();
          if (mounted) {
            setPdfArrayBuffer(arrayBuffer);
          }
        } catch (fetchError) {
          console.warn('Could not fetch PDF as ArrayBuffer, falling back to URL mode', fetchError);
          // Continue with URL mode if ArrayBuffer fetch fails
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (mounted) {
          setError('Failed to load PDF. Please try again later.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      loadPdf();
    }

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [pdfPath, isOpen]);

  // Update page width when container resizes
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.offsetWidth * 0.9); // 90% of container width
      }
    };

    // Initial width
    updateWidth();

    // Add resize observer
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [isOpen]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };

  const handleDownload = () => {
    if (!signedUrl) return;
    
    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = pdfPath.split('/').pop() || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download PDF"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-6" ref={containerRef}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-destructive">
              <p className="mb-4">{error}</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <Document
                  file={pdfArrayBuffer || signedUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  }
                  error={
                    <div className="text-destructive p-4">
                      Failed to load PDF. The file may be corrupted or the link may be invalid.
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={pageWidth} 
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-pulse">Loading page...</div>
                      </div>
                    }
                  />
                </Document>
              </div>
              
              {numPages > 0 && (
                <div className="flex items-center justify-between w-full mt-4 px-4 py-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomOut}
                      disabled={scale <= 0.5}
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={zoomIn}
                      disabled={scale >= 2.0}
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {pageNumber} of {numPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="w-20">
                    {/* Empty div for layout balance */}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
