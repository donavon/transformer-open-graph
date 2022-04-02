import fetch from 'node-fetch';
import type { Transformer } from '@remark-embedder/core';

type OpenGraphNinja = {
  hostname: string;
  requestUrl: string;
  title: string;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  };
  details?: {
    ogUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    twitterCard?: string;
    twitterCreator?: string;
    twitterSite?: string;
    twitterTitle?: string;
    twitterDescription?: string;
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

const encodeHtml = (html: string) =>
  html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getImageHtml = (data?: OpenGraphNinja) =>
  data?.image
    ? `<img src="${encodeHtml(data.image.url)}" alt="${encodeHtml(
        data.image.alt ?? data.title ?? data.description
      )}" class="ogn-image">`
    : '';

const transformer: Transformer = {
  name: 'transformer-open-graph',

  async shouldTransform(url) {
    try {
      const resp = await fetch(
        `https://opengraph.ninja/api/v1?url=${encodeURIComponent(url)}`,
        { method: 'HEAD' }
      );
      return resp.ok;
    } catch {
      return false;
    }
  },

  async getHTML(url): Promise<string> {
    try {
      const resp = await fetch(
        `https://opengraph.ninja/api/v1?url=${encodeURIComponent(url)}`
      );
      if (!resp.ok) return url;
      const data = (await resp.json()) as OpenGraphNinja;

      return `
    <div class="ogn-outer-container">
      <a class="ogn-container" href="${encodeHtml(
        data.requestUrl
      )}" target="_blank" rel="noopener noreferrer" data-twitter-card="${
        data.details?.twitterCard ?? ''
      }">
        ${getImageHtml(data)}
        <div class="ogn-content">
          <p class="ogn-content-title">${encodeHtml(data.title ?? '')}</p>
          <p class="ogn-content-description">${encodeHtml(
            data.description ?? ''
          )}</p>
          <p class="ogn-content-url">${encodeHtml(data.hostname)}</p>
        </div>
      </a>
      </div>
    `;
    } catch {
      return url;
    }
  },
};

export default transformer;
