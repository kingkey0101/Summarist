export type BookDetail = {
  id: string;
  author?: string;
  title: string;
  subTitle?: string;
  imageLink?: string;
  audioLink: string;
  totalRating?: number;
  averageRating?: number;
  keyIdeas?: string | string[];
  type?: string;
  status: string;
  subscriptionRequired: boolean;
  summary: string;
  tags?: string[];
  bookDescription?: string;
  authorDescription?: string;
};
