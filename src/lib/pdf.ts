import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Exports a DOM element to an exact standard A4 PDF document (210mm x 297mm).
 * Enforces standard corporate document proportions (1:1.414 A4 ratio) without miniaturization or clipping.
 */
export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Create an offscreen isolation container with standard A4 width (794px = 210mm at 96 DPI)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '-10000px';
  container.style.width = '794px';
  container.style.minWidth = '794px';
  container.style.maxWidth = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.overflow = 'visible';
  container.style.boxSizing = 'border-box';
  container.style.margin = '0';
  container.style.padding = '0';

  // Clone element into offscreen container
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = `${elementId}-pdf-export-clone`;
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.transform = 'none';
  clone.style.backgroundColor = '#ffffff';
  clone.style.boxSizing = 'border-box';

  // Remove any elements marked with .print-hidden
  const hiddenElements = clone.querySelectorAll('.print-hidden');
  hiddenElements.forEach(el => el.remove());

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Wait for web fonts (e.g. Noto Sans Thai) to be fully loaded
    if (document.fonts) {
      await document.fonts.ready;
    }
    // Brief layout settle
    await new Promise(resolve => setTimeout(resolve, 150));

    // Render to crisp, high-DPI PNG (2.5x pixel ratio for razor-sharp Thai tone marks and table borders)
    const dataUrl = await htmlToImage.toPng(clone, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      width: 794,
    });

    // Initialize standard A4 PDF (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    // Single page tolerance (if height is within standard single A4 page with small margin buffer)
    if (pdfHeight <= pageHeight + 2) {
      // Exactly fit standard A4 page
      const renderHeight = Math.min(pdfHeight, pageHeight);
      pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, renderHeight, undefined, 'FAST');
    } else {
      // Clean multi-page pagination for longer documents
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pageWidth, pdfHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pageWidth, pdfHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
  } catch (error) {
    console.error('Error generating standard A4 PDF:', error);
  } finally {
    // Cleanup offscreen container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

/**
 * Triggers native browser print for the document.
 * On Mobile: Invokes native window.print() (AirPrint / Save as PDF) directly with calibrated @media print styles.
 * On Desktop: Uses an isolated iframe to guarantee 100% exact A4 paper scale without modal distortion or clipping.
 */
export const printA4Document = (elementId: string, docTitle?: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element ${elementId} not found, falling back to window.print()`);
    window.print();
    return;
  }

  // Set document title temporarily for clean PDF filename in "Save as PDF"
  const originalTitle = document.title;
  if (docTitle) {
    document.title = docTitle;
  }

  // Detect mobile or small touch screen devices
  const isMobile = typeof navigator !== 'undefined' && (
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.innerWidth < 768)
  );

  if (isMobile) {
    // Mobile browsers (Safari iOS, Chrome Mobile) restrict iframe printing.
    // Trigger window.print() directly so native AirPrint / Save as PDF uses @media print styles.
    window.print();
    if (docTitle) {
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    }
    return;
  }

  // Desktop: Create an isolated iframe for clean, unclipped print output
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';
  iframe.style.opacity = '0.01';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    if (docTitle) {
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
    return;
  }

  // Clone document content and strip out print-hidden items
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.print-hidden').forEach(el => el.remove());

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="utf-8" />
        <title>${docTitle || 'เอกสารจัดซื้อมาตรฐาน A4'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Sans+Thai:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: 'Inter', 'Sarabun', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            word-break: break-word;
            overflow-wrap: break-word;
            width: 100%;
          }
          .standard-a4-doc {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: #ffffff !important;
            transform: none !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            box-sizing: border-box;
          }
          .print-hidden {
            display: none !important;
          }
        </style>
        ${Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
          .map(style => style.outerHTML)
          .join('\n')}
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for fonts and styles to initialize in iframe
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Iframe print error, falling back to window.print()', e);
      window.print();
    } finally {
      if (docTitle) {
        document.title = originalTitle;
      }
      // Clean up iframe after print dialog finishes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  }, 350);
};
