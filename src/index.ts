import path from 'path';
import type { Transformer } from '@remark-embedder/core';
import fetch from 'make-fetch-happen';
import { OpenGraphNinja, openGraphNinjaUrl } from './openGraphNinja';
import { defaultRender } from './defaultRender';

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
export type OpenGraphRender = (ogData: OpenGraphNinja) => string;
export type OpenGraphConfig = {
  render?: OpenGraphRender;
};

const transformer: Transformer<OpenGraphConfig> = {
  name: 'donavon/transformer-open-graph',

  shouldTransform: async (url) => {
    const result = await fetchOpenGraph(url);
    return !!result;
  },

  getHTML: async (urlString, config = {}) => {
    const data = await fetchOpenGraph(urlString);

    // istanbul ignore if (shouldTransform prevents this, but if someone calls this directly then this would save them)
    if (!data) return null;

    const { render = defaultRender } = config;
    return render(data);
  },
};

export default transformer;
