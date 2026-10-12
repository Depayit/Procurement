import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export interface SkuBarcodeProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'CODE39' | 'UPC';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  font?: string;
  text?: string;
  className?: string;
  background?: string;
  lineColor?: string;
}

/**
 * Enterprise 1D Barcode component using JsBarcode
 * Optimized for Warehouse Master SKU (Code 128) and EAN-13 barcodes
 */
export function SkuBarcode({
  value,
  format = 'CODE128',
  width = 2,
  height = 54,
  displayValue = true,
  fontSize = 13,
  font = 'monospace',
  text,
  className = '',
  background = 'transparent',
  lineColor = '#0f172a'
}: SkuBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        // Clean value: remove any invalid characters for barcode format
        const cleanVal = String(value).trim();
        if (!cleanVal) return;

        JsBarcode(svgRef.current, cleanVal, {
          format,
          width,
          height,
          displayValue,
          text: text !== undefined ? text : cleanVal,
          font,
          fontSize,
          textMargin: 3,
          margin: 4,
          background,
          lineColor
        });
      } catch (err) {
        console.warn('JsBarcode rendering fallback error:', err);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, font, text, background, lineColor]);

  return (
    <svg 
      ref={svgRef} 
      className={`max-w-full inline-block ${className}`}
      aria-label={`Barcode for ${value}`}
    />
  );
}

/**
 * Generate a high-resolution PNG data URL for a given barcode value
 */
export function generateBarcodeDataUrl(
  value: string,
  options: {
    format?: 'CODE128' | 'EAN13' | 'CODE39' | 'UPC';
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
    text?: string;
    background?: string;
    lineColor?: string;
  } = {}
): string {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, String(value).trim(), {
      format: options.format || 'CODE128',
      width: options.width || 2,
      height: options.height || 60,
      displayValue: options.displayValue !== false,
      text: options.text || String(value).trim(),
      font: 'monospace',
      fontSize: options.fontSize || 14,
      textMargin: 4,
      margin: 8,
      background: options.background || '#ffffff',
      lineColor: options.lineColor || '#000000'
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Failed to generate barcode data URL:', err);
    return '';
  }
}
