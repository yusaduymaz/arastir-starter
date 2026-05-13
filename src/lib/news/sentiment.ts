const positiveWords = [
  "kâr", "karlı", "karlılık", "büyüme", "büyüdü", "artış", "arttı", "olumlu", 
  "rekor", "yükseliş", "yükseldi", "beklentiyi aştı", "potansiyel", "başarı", 
  "başarılı", "iyileşme", "kazanç", "temettü", "pozitif", "zirve"
];

const negativeWords = [
  "zarar", "düşüş", "düştü", "küçülme", "küçüldü", "olumsuz", "risk", "riskli",
  "gerileme", "geriledi", "beklentinin altında", "kayıp", "uyarı", "negatif",
  "kriz", "endişe", "yavaşlama", "kötümser", "baskı"
];

export function analyzeSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral', score: number } {
  if (!text) {
    return { sentiment: 'neutral', score: 0 };
  }

  const lowerText = text.toLocaleLowerCase('tr-TR');
  let score = 0;

  positiveWords.forEach(word => {
    // Simple occurrence count
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length;
    }
  });

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      score -= matches.length;
    }
  });

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (score > 0) sentiment = 'positive';
  if (score < 0) sentiment = 'negative';

  return { sentiment, score };
}
