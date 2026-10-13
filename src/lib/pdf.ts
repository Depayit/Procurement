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
 * Triggers native browser print for standard documents with 100% precision.
 * Uses an isolated print mount container attached directly to <body>.
 * Guarantees:
 * - Document starts immediately on Page 1 (Zero preceding blank pages!)
 * - Zero excessive top margin drift
 * - Full fidelity for all Tailwind CSS classes, fonts, SVG icons, and print colors
 * - Seamless support across all platforms: Android Chrome, iOS Safari, Desktop Chrome/Edge/Firefox
 */
export const printA4Document = (elementId: string, docTitle?: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const element = document.getElementById(elementId) || 
                  document.querySelector<HTMLElement>(`#${elementId}, .standard-a4-doc, .standard-manual-doc`);

  if (!element) {
    console.warn(`Element ${elementId} not found, falling back to window.print()`);
    window.print();
    return;
  }

  const originalTitle = document.title;
  if (docTitle) {
    document.title = docTitle;
  }

  // Remove any stale print mount container from previous print sessions
  const existingMount = document.getElementById('procuresync-print-mount');
  if (existingMount) {
    existingMount.remove();
  }

  // Create clean isolated container directly under <body>
  const printMount = document.createElement('div');
  printMount.id = 'procuresync-print-mount';

  // Deep clone target document element
  const clone = element.cloneNode(true) as HTMLElement;

  // Strip out any UI controls marked as print-hidden (buttons, toggles, zoom pickers)
  clone.querySelectorAll('.print-hidden').forEach(el => el.remove());

  // Reset any zoom scales or viewport preview transforms from modal viewports
  clone.style.transform = 'none';
  clone.style.width = '100%';
  clone.style.maxWidth = '100%';
  clone.style.minWidth = '0';
  clone.style.minHeight = '0';
  clone.style.margin = '0 auto';
  clone.style.padding = '0';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';

  printMount.appendChild(clone);
  document.body.appendChild(printMount);
  document.body.classList.add('procuresync-print-active');

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.body.classList.remove('procuresync-print-active');
    const mount = document.getElementById('procuresync-print-mount');
    if (mount) {
      mount.remove();
    }
    if (docTitle) {
      document.title = originalTitle;
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup, { once: true });

  // Brief timeout to allow DOM repaint & stylesheet calculation before triggering native print spooler
  setTimeout(() => {
    try {
      window.print();
    } finally {
      // Fallback cleanup timer (Android and older iOS webviews may occasionally skip the afterprint event)
      setTimeout(cleanup, 2500);
    }
  }, 80);
};

// Global listener for native keyboard shortcuts (Ctrl+P / Cmd+P) or browser menu "Print"
if (typeof window !== 'undefined') {
  window.addEventListener('beforeprint', () => {
    // Only auto-mount if not already triggered programmatically by printA4Document()
    if (!document.body.classList.contains('procuresync-print-active')) {
      const activeDoc = document.querySelector<HTMLElement>(
        '#preview-pr-doc, #standard-pr-doc, #po-document-view, #standard-pr-doc-approval, #standard-manual-doc-modal, #standard-manual-doc, .standard-a4-doc'
      );
      if (activeDoc) {
        const existingMount = document.getElementById('procuresync-print-mount');
        if (existingMount) existingMount.remove();

        const printMount = document.createElement('div');
        printMount.id = 'procuresync-print-mount';

        const clone = activeDoc.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.print-hidden').forEach(el => el.remove());
        clone.style.transform = 'none';
        clone.style.width = '100%';
        clone.style.maxWidth = '100%';
        clone.style.minWidth = '0';
        clone.style.minHeight = '0';
        clone.style.margin = '0 auto';
        clone.style.padding = '0';
        clone.style.boxShadow = 'none';
        clone.style.border = 'none';

        printMount.appendChild(clone);
        document.body.appendChild(printMount);
        document.body.classList.add('procuresync-print-active');
      }
    }
  });

  window.addEventListener('afterprint', () => {
    document.body.classList.remove('procuresync-print-active');
    const mount = document.getElementById('procuresync-print-mount');
    if (mount) mount.remove();
  });
}
