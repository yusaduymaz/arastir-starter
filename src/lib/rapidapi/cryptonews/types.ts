export interface CryptoNewsArticle {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  createdAt: string;
  source: string;
}

export interface CryptoNewsResponse {
  data: CryptoNewsArticle[];
}
