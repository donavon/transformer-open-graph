export const openGraphNinjaUrl = 'https://opengraph.ninja/api/v1';

export type OpenGraphNinja = {
  hostname: string;
  requestUrl: string;
  title?: string;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  };
  details?: {
    author?: string;
    ogUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: string;
    twitterCreator?: string;
    twitterSite?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    ogType?: string;
    ogSiteName?: string;
    ogImage?: {
      url?: string;
      width?: string;
      height?: string;
      type?: string;
    };
    twitterImage?: {
      url?: string;
      width?: string;
      height?: string;
      alt?: string;
    };
    ogLocale?: string;
  };
};
