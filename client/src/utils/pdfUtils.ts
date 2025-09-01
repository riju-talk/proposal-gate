
import { supabase } from '@/integrations/supabase/client';

export const getPdfUrl = async (pdfPath: string): Promise<string | null> => {
  try {
    console.log('Getting PDF URL for path:', pdfPath);
    
    // Extract the file path from the full URL if needed
    let filePath = pdfPath;
    
    // Handle different URL formats
    if (pdfPath.includes('/storage/v1/object/public/event-proposals/')) {
      // Extract just the filename from the public URL
      filePath = pdfPath.split('/storage/v1/object/public/event-proposals/')[1];
    } else if (pdfPath.includes('event-proposals/')) {
      // For paths that already include the bucket prefix
      filePath = pdfPath.split('event-proposals/')[1];
    } else if (pdfPath.startsWith('http')) {
      // For full URLs, try to extract filename from the end
      const urlParts = pdfPath.split('/');
      filePath = urlParts[urlParts.length - 1];
    }
    
    console.log('Extracted file path:', filePath);
    
    // Get a signed URL for the PDF
    const { data, error } = await supabase.storage
      .from('event-proposals')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    console.log('Generated signed URL:', data.signedUrl);
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getPdfUrl:', error);
    return null;
  }
};

export const openPdfInNewTab = async (pdfPath: string) => {
  const signedUrl = await getPdfUrl(pdfPath);
  if (signedUrl) {
    window.open(signedUrl, '_blank');
  } else {
    console.error('Failed to get PDF URL');
    alert('Error: Unable to open PDF document');
  }
};
