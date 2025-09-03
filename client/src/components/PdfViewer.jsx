import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const PdfViewer = ({ file, className = '' }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 2.5));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  const downloadPdf = () => {
    if (!file) return;
    
    const link = document.createElement('a');
    link.href = typeof file === 'string' ? file : URL.createObjectURL(file);
    link.download = 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!file) {
    return (
      <div className={`flex items-center justify-center border rounded-md p-8 bg-muted/50 ${className}`}>
        <p className="text-muted-foreground">No PDF file provided</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`border rounded-md overflow-hidden bg-background ${className}`}
    >
      <div className="border-b p-2 flex items-center justify-between bg-muted/50">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={zoomOut}
            disabled={scale <= 0.5}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={zoomIn}
            disabled={scale >= 2.5}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadPdf}
            title="Download PDF"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      <div className="overflow-auto p-4 flex flex-col items-center">
        {loading && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-8 text-destructive">
            <p>{error}</p>
          </div>
        )}

        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              width={containerWidth ? Math.min(containerWidth - 64, 800) : 600}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>

      {numPages > 1 && (
        <div className="border-t p-2 flex items-center justify-between bg-muted/50">
          <div className="text-sm text-muted-foreground">
            Page {pageNumber} of {numPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
