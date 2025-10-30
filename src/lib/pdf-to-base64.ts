/**
 * Fetches a PDF from a URL and converts it to a base64 data URL
 * for use with OpenAI's vision models
 */
export async function pdfUrlToBase64DataUrl(url: string): Promise<string> {
  try {
    console.log(`[PDF Fetch] Fetching PDF from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    // Get the PDF as an array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64 = buffer.toString('base64');

    // Create a data URL
    const dataUrl = `data:application/pdf;base64,${base64}`;

    console.log(`[PDF Fetch] Successfully converted PDF to base64 (${Math.round(buffer.length / 1024)}KB)`);

    return dataUrl;
  } catch (error) {
    console.error('[PDF Fetch] Error fetching/converting PDF:', error);
    throw error;
  }
}
