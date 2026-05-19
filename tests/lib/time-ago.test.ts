// WAVE 0 — Bu fonksiyon 22-02-PLAN.md Görev 1 ile history/[id]/page.tsx'e eklenecek.
// Test sözleşmeyi belgeler.
// timeAgo Wave 0'da src/ içinde tanımlı değil — inline tanım kullanılıyor.

// Inline fonksiyon tanımı (Wave 1 implementasyonuyla aynı sözleşmeyi belgeliyor):
function timeAgo(fetchedAt: number | string | null | undefined): string {
  if (fetchedAt == null) return '-';
  const ts = typeof fetchedAt === 'string' ? new Date(fetchedAt).getTime() : fetchedAt;
  const diffMs = Date.now() - ts;
  if (diffMs < 60_000) return 'Az önce güncellendi';
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} dakika önce güncellendi`;
  const diffHr = Math.round(diffMin / 60);
  return `${diffHr} saat önce güncellendi`;
}

describe('timeAgo', () => {
  it('timeAgo(Date.now() - 60000) → "1 dakika önce güncellendi"', () => {
    const result = timeAgo(Date.now() - 60_000);
    expect(result).toBe('1 dakika önce güncellendi');
  });

  it('timeAgo(Date.now() - 3660000) → "1 saat önce güncellendi"', () => {
    // DIKKAT: 3_600_000 ms = tam 60 dakika → Math.round(60/60)=1 saat ANCAK
    // Math.round(60) = 60 dakika (60 < 60 koşulu sağlanmaz) YANLIŞ olur.
    // Doğru: 3_660_000 ms = 61 dakika → Math.round(61/60) = 1 saat
    const result = timeAgo(Date.now() - 3_660_000);
    expect(result).toBe('1 saat önce güncellendi');
  });

  it('timeAgo(null) → "-"', () => {
    expect(timeAgo(null)).toBe('-');
  });

  // Ek testler
  it('timeAgo(Date.now() - 30000) → "Az önce güncellendi" (30 saniye önce)', () => {
    const result = timeAgo(Date.now() - 30_000);
    expect(result).toBe('Az önce güncellendi');
  });

  it('timeAgo(Date.now() - 300000) → "5 dakika önce güncellendi"', () => {
    const result = timeAgo(Date.now() - 5 * 60_000);
    expect(result).toBe('5 dakika önce güncellendi');
  });

  it('ISO string girişi: timeAgo(new Date(Date.now() - 120000).toISOString()) → "2 dakika önce güncellendi"', () => {
    const isoStr = new Date(Date.now() - 120_000).toISOString();
    const result = timeAgo(isoStr);
    expect(result).toBe('2 dakika önce güncellendi');
  });

  it('timeAgo(undefined) → "-"', () => {
    expect(timeAgo(undefined)).toBe('-');
  });
});
