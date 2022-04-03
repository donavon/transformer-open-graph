import path from 'path';
import type { Transformer } from '@remark-embedder/core';
import fetch from 'make-fetch-happen';
import { OpenGraphNinja, openGraphNinjaUrl } from './openGraphNinja';
import { encodeHtml } from './encodeHtml';

const getImageHtml = (data?: OpenGraphNinja) =>
  data?.image
    ? `<img src="${encodeHtml(data.image.url)}" alt="${encodeHtml(
        data.image.alt ?? data.title ?? ''
      )}" class="ogn-image">`
    : '';

fetch.defaults({
  cachePath: path.join(
    process.cwd(),
    'node_modules/.cache/donavon/transformer-open-graph/fetch'
  ),
});

async function fetchOpenGraph(url: string): Promise<OpenGraphNinja | null> {
  try {
    const res = await fetch(
      `${openGraphNinjaUrl}?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;

    const data = (await res.json()) as OpenGraphNinja;
    return data;
  } catch {
    return null;
  }
}

const transformer: Transformer = {
  name: 'donavon/transformer-open-graph',
  shouldTransform: async (url) => {
    const result = await fetchOpenGraph(url);
    return !!result;
  },
  getHTML: async (urlString) => {
    const data = await fetchOpenGraph(urlString);

    // istanbul ignore if (shouldTransform prevents this, but if someone calls this directly then this would save them)
    if (!data) return null;

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
  },
};

export default transformer;
