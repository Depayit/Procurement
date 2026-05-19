import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Temporarily hide elements that shouldn't be in the PDF
    const hiddenElements = element.querySelectorAll('.print-hidden');
    hiddenElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Remove height constraints to capture full content
    const originalMaxHeight = element.style.maxHeight;
    element.style.maxHeight = 'none';
    const scroller = element.querySelector('.overflow-y-auto') as HTMLElement;
    const originalOverflow = scroller ? scroller.style.overflowY : '';
    if (scroller) {
      scroller.style.overflowY = 'visible';
    }

    const dataUrl = await htmlToImage.toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    // Restore styles
    element.style.maxHeight = originalMaxHeight;
    if (scroller) {
      scroller.style.overflowY = originalOverflow;
    }

    // Restore hidden elements
    hiddenElements.forEach(el => {
      (el as HTMLElement).style.display = '';
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Get image dimensions
    const imgProps = pdf.getImageProperties(dataUrl);
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
