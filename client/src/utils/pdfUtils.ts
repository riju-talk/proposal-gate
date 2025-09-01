
import { supabase } from '@/integrations/supabase/client';

export const getPdfUrl = async (pdfPath: string): Promise<string | null> => {
  try {
    console.log('Getting PDF URL for path:', pdfPath);
    
    // Extract the file path from the full URL if needed
    const filePath = pdfPath.includes('event-proposals/') 
      ? pdfPath.split('event-proposals/')[1] 
      : pdfPath;
    
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
