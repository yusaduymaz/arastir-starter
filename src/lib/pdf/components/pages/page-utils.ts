import { ReportData } from '../../../../types/research';
import { stripMarkdown } from '../../markdown-utils';

export function reportDate(data: ReportData) {
  return new Date(data.dateGenerated).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function reportCompany(data: ReportData) {
  return data.title.split(' ')[0] || 'ARAŞTIR';
}

export function titleWithoutTicker(data: ReportData) {
  return data.title.replace(/^([A-Z0-9.\-]+)\s+/i, '').trim() || data.title;
}

export function paragraphs(content?: string, fallback = 'Veri bulunamadı.') {
  const clean = stripMarkdown(content || fallback);
  return clean.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

export function compactText(value?: string, limit = 240) {
  const clean = stripMarkdown(value || '');
  return clean.length > limit ? `${clean.slice(0, limit - 3)}...` : clean;
}

export function sentimentLabel(sentiment?: string) {
  const normalized = (sentiment || '').toLowerCase();
  if (normalized.includes('pozitif') || normalized.includes('positive') || normalized.includes('olumlu')) return 'Pozitif';
  if (normalized.includes('negatif') || normalized.includes('negative') || normalized.includes('olumsuz')) return 'Negatif';
  return 'Nötr';
}

