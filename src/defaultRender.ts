import { encodeHtml } from './encodeHtml';
import { OpenGraphNinja } from './openGraphNinja';

const getImageHtml = (data?: OpenGraphNinja) =>
  data?.image
    ? `<img src="${encodeHtml(data.image.url)}" alt="${encodeHtml(
        data.image.alt ?? data.title ?? ''
      )}" class="ogn-image">`
    : '';

export const defaultRender = (data: OpenGraphNinja): string =>
  `
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
