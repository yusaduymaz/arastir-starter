export interface NewsProvider {
  name: string;
  favIcon: string;
}

export interface NewsImage {
  url: string;
  height: number;
  width: number;
  thumbnail: string;
  thumbnailHeight: number;
  thumbnailWidth: number;
}

export interface TurkeyNewsArticle {
  id: string;
  title: string;
  url: string;
  description: string;
  body: string;
  keywords: string;
  language: string;
  datePublished: string;
  isSafe: boolean;
  provider: NewsProvider;
  image: NewsImage;
}

export interface TurkeyNewsResponse {
  _type: string;
  totalCount: number;
  value: TurkeyNewsArticle[];
  relatedSearch: string[];
  didUMean: string;
}
