// WAVE 0 — Bu fonksiyon 22-01-PLAN.md Görev 2 ile history/[id]/page.tsx'e eklenecek.
// Test sözleşmeyi belgeler ve implementasyon sonrası import ile güncellenecek.
// getLatestNonNull Wave 0'da src/ içinde tanımlı değil — inline tanım kullanılıyor.

// Inline fonksiyon tanımı (Wave 1 implementasyonuyla aynı sözleşmeyi belgeliyor):
function getLatestNonNull(data: any[], field: string): string | null {
  if (!data || data.length === 0) return null;
  for (let i = data.length - 1; i >= 0; i--) {
    const val = data[i][field];
    if (val != null && val !== '' && val !== 'ND') return String(val);
  }
  return null;
}

describe('getLatestNonNull', () => {
  it('returns last non-null value from array (TP_FG_J0)', () => {
    const points = [
      { TP_FG_J0: '68.50' },
      { TP_FG_J0: null },
      { TP_FG_J0: '69.80' },
    ];
    expect(getLatestNonNull(points, 'TP_FG_J0')).toBe('69.80');
  });

  it('returns null when all values are null, ND, or empty', () => {
    const points = [
      { TP_FG_J0: null },
      { TP_FG_J0: 'ND' },
      { TP_FG_J0: '' },
    ];
    expect(getLatestNonNull(points, 'TP_FG_J0')).toBeNull();
  });

  it('returns correct value when only last entry is valid', () => {
    const points = [
      { TP_FG_J0: null },
      { TP_FG_J0: null },
      { TP_FG_J0: '70.10' },
    ];
    expect(getLatestNonNull(points, 'TP_FG_J0')).toBe('70.10');
  });

  // Edge case: boş dizi
  it('returns null for empty array', () => {
    expect(getLatestNonNull([], 'TP_FG_J0')).toBeNull();
  });

  // Edge case: 'ND' değeri atlanır, önceki geçerli değer döner
  it('skips ND value and returns previous valid value', () => {
    const points = [
      { TP_FG_J0: '69.80' },
      { TP_FG_J0: 'ND' },
    ];
    expect(getLatestNonNull(points, 'TP_FG_J0')).toBe('69.80');
  });

  // Edge case: farklı alan adı (TP_DK_USD_A)
  it('works with different field names (TP_DK_USD_A)', () => {
    const points = [
      { TP_DK_USD_A: null },
      { TP_DK_USD_A: '32.50' },
      { TP_DK_USD_A: null },
    ];
    // Son null'dan sonra geriye bakıyor: '32.50' dönmeli
    expect(getLatestNonNull(points, 'TP_DK_USD_A')).toBe('32.50');
  });
});
