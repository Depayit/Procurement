/**
 * Converts numeric Thai Baht amount into Thai written words (Baht Text).
 * e.g., 350000 -> "สามแสนห้าหมื่นบาทถ้วน"
 * e.g., 1250.50 -> "หนึ่งพันสองร้อยห้าสิบบาทห้าสิบสตางค์"
 */

const THAI_NUMBERS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

function convertGroup(digits: string): string {
  let result = '';
  const len = digits.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(digits[i], 10);
    const pos = len - i - 1;

    if (digit === 0) continue;

    if (pos === 0 && digit === 1 && len > 1 && parseInt(digits[len - 2], 10) !== 0) {
      result += 'เอ็ด';
    } else if (pos === 1 && digit === 1) {
      result += 'สิบ';
    } else if (pos === 1 && digit === 2) {
      result += 'ยี่สิบ';
    } else {
      result += THAI_NUMBERS[digit] + THAI_UNITS[pos];
    }
  }

  return result;
}

export function bahtText(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'ศูนย์บาทถ้วน';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Round to 2 decimal places
  const fixed = absAmount.toFixed(2);
  const [bahtPart, satangPart] = fixed.split('.');

  let bahtTextStr = '';

  // Handle million divisions
  let remainingBaht = bahtPart;
  const millions: string[] = [];

  while (remainingBaht.length > 6) {
    millions.unshift(remainingBaht.slice(-6));
    remainingBaht = remainingBaht.slice(0, -6);
  }
  millions.unshift(remainingBaht);

  for (let i = 0; i < millions.length; i++) {
    const groupText = convertGroup(millions[i]);
    if (groupText) {
      bahtTextStr += groupText;
      if (i < millions.length - 1) {
        bahtTextStr += 'ล้าน';
      }
    }
  }

  let satangText = '';
  const satangVal = parseInt(satangPart, 10);
  if (satangVal > 0) {
    satangText = convertGroup(satangPart) + 'สตางค์';
  }

  let full = (isNegative ? 'ลบ' : '');
  if (bahtTextStr) {
    full += bahtTextStr + 'บาท';
  } else if (satangVal > 0) {
    full += 'ศูนย์บาท';
  }

  if (satangVal > 0) {
    full += satangText;
  } else {
    full += 'ถ้วน';
  }

  return full;
}
