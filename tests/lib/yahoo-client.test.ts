// WAVE 0 — CompanyOverviewSchema passthrough() kullandığı için bu testler Wave 0'da GEÇİYOR.
// 22-03-PLAN.md Görev 1 tamamlandıktan sonra yeni alanlar explicit tanımlı olacak ve
// default('') güvencesi eklenecek. Bu testler o noktada da geçmeye devam etmeli.
//
// NOT: PBRatio, Beta, ROE, ROA, NetMargin, FloatShares alanları 22-03 ile schema'ya
// explicit ekleneceğinden Wave 0'da bu alanlar passthrough ile geçer fakat default('')
// güvencesi henüz yoktur. Testler bu davranışı belgeler.

import { CompanyOverviewSchema } from '@/types/market';

describe('CompanyOverviewSchema', () => {
  it('accepts PBRatio, Beta, ROE, ROA, NetMargin, FloatShares fields via passthrough', () => {
    const input = {
      Symbol: 'THYAO',
      PBRatio: '2.5',
      Beta: '1.2',
      ROE: '23.45',
      ROA: '8.90',
      NetMargin: '12.34',
      FloatShares: '500000000',
    };

    // passthrough() sayesinde hata atmaz
    const result = CompanyOverviewSchema.parse(input);
    expect(result.Symbol).toBe('THYAO');
    // Passthrough alanlar olduğu gibi iletilir
    expect((result as any).PBRatio).toBe('2.5');
    expect((result as any).Beta).toBe('1.2');
    expect((result as any).ROE).toBe('23.45');
    expect((result as any).ROA).toBe('8.90');
    expect((result as any).NetMargin).toBe('12.34');
    expect((result as any).FloatShares).toBe('500000000');
  });

  it('parse succeeds when PBRatio/Beta/ROE/ROA/NetMargin/FloatShares are absent (optional passthrough fields)', () => {
    // Sadece zorunlu alan
    const input = { Symbol: 'THYAO' };
    const result = CompanyOverviewSchema.parse(input);
    expect(result.Symbol).toBe('THYAO');
    // Opsiyonel alanlar default('') ile dönmeli (schema tanımlı alanlar)
    expect(result.Name).toBe('');
    expect(result.PERatio).toBe('');
  });

  it('ROE value 0.23 passes through as-is (not multiplied in schema)', () => {
    // NOT: Schema çarpma yapmaz — çarpma yahoo-client.ts mapping katmanında yapılır.
    // Bu test implementasyon sınırını belgeler: tipin içi değil, mapping katmanı dönüştürür.
    const input = { Symbol: 'TEST', ROE: '0.23' };
    const result = CompanyOverviewSchema.parse(input);
    // Schema değeri değiştirmez — '0.23' olarak kalır
    expect((result as any).ROE).toBe('0.23');
  });
});
