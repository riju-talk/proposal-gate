import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, Loader2, ExternalLink } from 'lucide-react';

export const PdfViewer = ({ url, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (url) {
      setLoading(false);
    }
  }, [url]);

  const openInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const downloadPdf = () => {
    if (!url) return;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!url) {
    return (
      <div className={`flex items-center justify-center border rounded-md p-8 bg-white/5 border-white/20 ${className}`}>
        <p className="text-white/70">No PDF file provided</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center border rounded-md p-8 bg-white/5 border-white/20 ${className}`}>
        <p className="text-red-400 mb-4">Failed to load PDF</p>
        <Button onClick={openInNewTab} variant="outline" className="bg-white/5 border-white/20 text-white">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
      </div>
    );
  }

  return (
    <div className={`border rounded-md overflow-hidden bg-white/5 border-white/20 ${className}`}>
      <div className="border-b border-white/20 p-2 flex items-center justify-between bg-white/5">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/70">PDF Document</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={openInNewTab}
            className="text-white/70 hover:bg-white/10"
            title="Open in New Tab"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            <span>Open</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadPdf}
            className="text-white/70 hover:bg-white/10"
            title="Download PDF"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      <div className="relative" style={{ height: '500px' }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-2" />
            <p className="text-sm text-white/70">Loading PDF...</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full"
          title="PDF Document"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load PDF');
          }}
        />
      </div>
    </div>
  );
};

export default PdfViewer;