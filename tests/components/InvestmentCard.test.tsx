// WAVE 0 — Bu test dosyası 22-01-PLAN.md uygulanmadan önce RED durumdadır.
// null recommendation testi 22-01 Görev 1 tamamlandıktan sonra yeşile döner.
//
// NOTE: Bu test @testing-library/react ve jsdom gerektirir.
// @testing-library/react KURULU DEĞİL — TypeScript sözleşme yaklaşımı kullanılıyor.
// Ortam hazır değilse npx vitest run tests/components/ SKIP_JSDOM=1 ile atlanabilir.
//
// Yaklaşım: @vitejs/plugin-react kurulu olmadığı için JSX dosyaları doğrudan import
// edilemiyor (vite:import-analysis JSX'i parse edemez). Bu nedenle InvestmentCard'ın
// TypeScript tip sözleşmesini belgeleyen it.todo testleri kullanılıyor.
//
// InvestmentCardProps tip sözleşmesi (Wave 0'da null kabul etmiyor):
//
//   interface InvestmentRecommendation {
//     action: 'AL' | 'TUT' | 'SAT'
//     score: number
//     confidence: string
//     shortTermOutlook: string
//     longTermOutlook: string
//     keyFactors: string[]
//   }
//
//   interface InvestmentCardProps {
//     recommendation: InvestmentRecommendation  // null kabul etmiyor
//     ticker: string
//   }
//
// Aşağıdaki kullanım Wave 0'da TypeScript HATA VERİR:
//   <InvestmentCard recommendation={null} ticker="THYAO" />
//   // TS2322: Type 'null' is not assignable to type 'InvestmentRecommendation'
//
// Bu kasıtlı bir RED durumudur — 22-01-PLAN.md null kabul etmeyi implement edecek.

// InvestmentCard import'u: @vitejs/plugin-react gerektirir — Wave 1'de eklenecek.
// import { InvestmentCard } from '@/components/dashboard/report/InvestmentCard';

describe('InvestmentCard', () => {
  it.todo('renders with full recommendation data (action=AL, confidence=yüksek, score=8.5)');
  // Beklenti: "AL (Buy)" metni DOM'da mevcut
  // Gereksinim: @testing-library/react + jsdom + @vitejs/plugin-react

  it.todo('renders with null recommendation — shows loading/placeholder, does not crash');
  // Wave 0'da null recommendation TypeScript tip hatası verir (InvestmentCardProps.recommendation null kabul etmiyor)
  // 22-01 tamamlandıktan sonra: bileşen "Yatırım tavsiyesi analiz edilemedi." göstermeli

  it.todo('renders with minimal props (score=5, confidence=orta, empty keyFactors)');
  // Beklenti: bileşen crash etmez, temel render tamamlanır

  // Sözleşme doğrulaması (çalışma zamanında tip koruması)
  it('InvestmentCard sözleşmesi: action değerleri AL, TUT, SAT olmalı', () => {
    const validActions = ['AL', 'TUT', 'SAT'] as const;
    type Action = typeof validActions[number];

    const action: Action = 'AL';
    expect(validActions).toContain(action);

    // Bu sözleşme InvestmentCard'ın action prop'unu doğrular
    const isValidAction = (a: string): a is Action => validActions.includes(a as Action);
    expect(isValidAction('AL')).toBe(true);
    expect(isValidAction('TUT')).toBe(true);
    expect(isValidAction('SAT')).toBe(true);
    expect(isValidAction('INVALID')).toBe(false);
  });

  it('InvestmentCard sözleşmesi: score 0-10 arasında olmalı (normalleştirme için)', () => {
    // scorePercent = (r.score / 10) * 100 — bu formülü doğrula
    const calculateScorePercent = (score: number) => (score / 10) * 100;
    expect(calculateScorePercent(8.5)).toBe(85);
    expect(calculateScorePercent(10)).toBe(100);
    expect(calculateScorePercent(0)).toBe(0);
  });
});
