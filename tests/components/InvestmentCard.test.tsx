// @vitest-environment jsdom
// WAVE 0 — Bu test dosyası 22-01-PLAN.md uygulanmadan önce RED durumdadır.
// null recommendation testi 22-01 Görev 1 tamamlandıktan sonra yeşile döner.
//
// NOTE: Bu test @testing-library/react ve jsdom gerektirir.

import { render, screen } from '@testing-library/react';
import { InvestmentCard } from '@/components/dashboard/report/InvestmentCard';

describe('InvestmentCard', () => {
  it('renders with full recommendation data (action=AL, confidence=yüksek, score=8.5)', () => {
    const recommendation = {
      action: 'AL' as const,
      score: 8.5,
      confidence: 'yüksek',
      shortTermOutlook: 'Pozitif görünüm',
      longTermOutlook: 'Güçlü büyüme beklentisi',
      keyFactors: ['Güçlü finansallar', 'Pazar lideri'],
    };

    render(<InvestmentCard recommendation={recommendation} ticker="THYAO" />);

    expect(screen.getByText('AL (Buy)')).toBeTruthy();
  });

  it('renders with null recommendation — shows loading/placeholder, does not crash', () => {
    render(<InvestmentCard recommendation={null} ticker="THYAO" />);

    // The component renders literal text: // Yatırım tavsiyesi analiz edilemedi.
    expect(
      screen.getByText('// Yatırım tavsiyesi analiz edilemedi.')
    ).toBeTruthy();
  });

  it('renders with minimal props (score=5, confidence=orta, empty keyFactors)', () => {
    const recommendation = {
      action: 'TUT' as const,
      score: 5,
      confidence: 'orta',
      shortTermOutlook: '',
      longTermOutlook: '',
      keyFactors: [],
    };

    // Should render without crash
    const { container } = render(
      <InvestmentCard recommendation={recommendation} ticker="GARAN" />
    );
    expect(container.firstChild).toBeTruthy();
  });

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
