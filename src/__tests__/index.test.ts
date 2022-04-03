import remarkEmbedder from '@remark-embedder/core';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import remark from 'remark';
import remarkHTML from 'remark-html';
import transformer, { OpenGraphConfig, OpenGraphRender } from '..';
import { OpenGraphNinja, openGraphNinjaUrl } from '../openGraphNinja';

const testJson: OpenGraphNinja = {
  hostname: 'donavon.com',
  requestUrl: 'https://donavon.com',
  title: 'TITLE',
  description: 'DESCRIPTION',
  image: {
    url: 'https://donavon.com/img/donavon-avatar.jpeg',
    alt: 'ALT',
  },
  details: {
    author: 'Donavon West',
    ogTitle: "Donavon West's website",
    ogDescription:
      'Donavon West is a full-stack software engineer living in the New York City area.',
    ogUrl: 'https://donavon.com/',
    ogLocale: 'en_US',
    ogType: 'website',
    ogSiteName: "Donavon West's website",
    twitterCard: 'summary',
    twitterTitle: "Donavon West's website",
    twitterDescription:
      'Donavon West is a full-stack software engineer living in the New York City area.',
    twitterSite: '@donavon',
    twitterCreator: '@donavon',
  },
};

// this removes the quotes around strings...
const unquoteSerializer = {
  serialize: (val: string) => val.trim(),
  test: (val: unknown) => typeof val === 'string',
};

expect.addSnapshotSerializer(unquoteSerializer);

const server = setupServer(
  rest.get(openGraphNinjaUrl, (req, res, ctx) => {
    const url = req.url.searchParams.get('url');

    if (url === 'https://example.com/') {
      return res(ctx.json(testJson));
    }
    if (url === 'https://example.com/noimage') {
      // deep clone the object
      const testWithoutImage = JSON.parse(
        JSON.stringify(testJson)
      ) as OpenGraphNinja;
      delete testWithoutImage.image;
      return res(ctx.json(testWithoutImage));
    }
    if (url === 'https://example.com/noimage-alt') {
      // deep clone the object
      const testWithoutImage = JSON.parse(
        JSON.stringify(testJson)
      ) as OpenGraphNinja;
      delete testWithoutImage.image?.alt;
      return res(ctx.json(testWithoutImage));
    }
    if (url === 'https://example.com/noimage-alt-title') {
      // deep clone the object
      const testWithoutImage = JSON.parse(
        JSON.stringify(testJson)
      ) as OpenGraphNinja;
      delete testWithoutImage.image?.alt;
      delete testWithoutImage.title;
      return res(ctx.json(testWithoutImage));
    }
    if (url === 'https://example.com/nodetails') {
      // deep clone the object
      const testWithoutImage = JSON.parse(
        JSON.stringify(testJson)
      ) as OpenGraphNinja;
      delete testWithoutImage.details;
      return res(ctx.json(testWithoutImage));
    }
    if (url === 'https://example.com/nodescription') {
      // deep clone the object
      const testWithoutImage = JSON.parse(
        JSON.stringify(testJson)
      ) as OpenGraphNinja;
      delete testWithoutImage.description;
      return res(ctx.json(testWithoutImage));
    }
    if (url === 'https://example.com/boom') {
      throw new Error('boom');
    }
    if (url === 'https://example.com/404') {
      return res(ctx.status(404), ctx.text('Not found'));
    }

    return res(ctx.json({}));
  })
);

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

test('renders nothing if the fetch throws', async () => {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [transformer],
    })
    .use(remarkHTML, { sanitize: false })
    .process('https://example.com/boom');

  expect(result.toString()).toMatchInlineSnapshot(
    `<p>https://example.com/boom</p>`
  );
});

test('renders nothing if fetch returns a non-2xx status', async () => {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [transformer],
    })
    .use(remarkHTML, { sanitize: false })
    .process('https://example.com/404');

  expect(result.toString()).toMatchInlineSnapshot(
    `<p>https://example.com/404</p>`
  );
});

describe('config options', () => {
  test('render allows for custom markup', async () => {
    const customRender: OpenGraphRender = (data) =>
      `<h2>Hello ${data.hostname}</h2>`;

    const config: OpenGraphConfig = { render: customRender };
    const result = await remark()
      .use(remarkEmbedder, {
        transformers: [[transformer, config]],
      })
      .use(remarkHTML, { sanitize: false })
      .process('https://example.com');

    console.log(result.toString());
    expect(result.toString()).toMatchInlineSnapshot(
      `<h2>Hello donavon.com</h2>`
    );
  });
});

test('renders a website with all Open Graph meta tags', async () => {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [transformer],
    })
    .use(remarkHTML, { sanitize: false })
    .process('https://example.com');

  expect(result.toString()).toMatchInlineSnapshot(`
    <div class="ogn-outer-container">
      <a class="ogn-container" href="https://donavon.com" target="_blank" rel="noopener noreferrer" data-twitter-card="summary">
        <img src="https://donavon.com/img/donavon-avatar.jpeg" alt="ALT" class="ogn-image">
        <div class="ogn-content">
          <p class="ogn-content-title">TITLE</p>
          <p class="ogn-content-description">DESCRIPTION</p>
          <p class="ogn-content-url">donavon.com</p>
        </div>
      </a>
    </div>
  `);
});

describe('the default renders using fallback properties if missing', () => {
  test('.image', async () => {
    const result = await remark()
      .use(remarkEmbedder, {
        transformers: [transformer],
      })
      .use(remarkHTML, { sanitize: false })
      .process('https://example.com/noimage');

    expect(result.toString()).toMatchInlineSnapshot(`
      <div class="ogn-outer-container">
        <a class="ogn-container" href="https://donavon.com" target="_blank" rel="noopener noreferrer" data-twitter-card="summary">
          
          <div class="ogn-content">
            <p class="ogn-content-title">TITLE</p>
            <p class="ogn-content-description">DESCRIPTION</p>
            <p class="ogn-content-url">donavon.com</p>
          </div>
        </a>
      </div>
    `);
  });

  test('.image.alt', async () => {
    const result = await remark()
      .use(remarkEmbedder, {
        transformers: [transformer],
      })
      .use(remarkHTML, { sanitize: false })
      .process('https://example.com/noimage-alt');

    expect(result.toString()).toMatchInlineSnapshot(`
      <div class="ogn-outer-container">
        <a class="ogn-container" href="https://donavon.com" target="_blank" rel="noopener noreferrer" data-twitter-card="summary">
          <img src="https://donavon.com/img/donavon-avatar.jpeg" alt="TITLE" class="ogn-image">
          <div class="ogn-content">
            <p class="ogn-content-title">TITLE</p>
            <p class="ogn-content-description">DESCRIPTION</p>
            <p class="ogn-content-url">donavon.com</p>
          </div>
        </a>
      </div>
    `);
  });

  test('.image.alt and .title', async () => {
    const result = await remark()
      .use(remarkEmbedder, {
        transformers: [transformer],
      })
      .use(remarkHTML, { sanitize: false })
      .process('https://example.com/noimage-alt-title');

    expect(result.toString()).toMatchInlineSnapshot(`
      <div class="ogn-outer-container">
        <a class="ogn-container" href="https://donavon.com" target="_blank" rel="noopener noreferrer" data-twitter-card="summary">
          <img src="https://donavon.com/img/donavon-avatar.jpeg" alt="" class="ogn-image">
          <div class="ogn-content">
            <p class="ogn-content-title"></p>
            <p class="ogn-content-description">DESCRIPTION</p>
            <p class="ogn-content-url">donavon.com</p>
          </div>
        </a>
      </div>
    `);
  });

  test('.details', async () => {
    const result = await remark()
      .use(remarkEmbedder, {
        transformers: [transformer],
      })
      .use(remarkHTML, { sanitize: false })
      .process('https://example.com/nodetails');

    expect(result.toString()).toMatchInlineSnapshot(`
      <div class="ogn-outer-container">
        <a class="ogn-container" href="https://donavon.com" target="_blank" rel="noopener noreferrer" data-twitter-card="">
          <img src="https://donavon.com/img/donavon-avatar.jpeg" alt="ALT" class="ogn-image">
          <div class="ogn-content">
            <p class="ogn-content-title">TITLE</p>
            <p class="ogn-content-description">DESCRIPTION</p>
            <p class="ogn-content-url">donavon.com</p>
          </div>
        </a>
      </div>
    `);
  });

  test('.description', async () => {
    const result = await remark()
      .use(remarkEmbedder, {
        transformers: [transformer],
      })
      .use(remarkHTML, { sanitize: false })
      .process('https://example.com/nodescription');

    expect(result.toString()).toMatchInlineSnapshot(`
      <div class="ogn-outer-container">
        <a class="ogn-container" href="https://donavon.com" target="_blank" rel="noopener noreferrer" data-twitter-card="summary">
          <img src="https://donavon.com/img/donavon-avatar.jpeg" alt="ALT" class="ogn-image">
          <div class="ogn-content">
            <p class="ogn-content-title">TITLE</p>
            <p class="ogn-content-description"></p>
            <p class="ogn-content-url">donavon.com</p>
          </div>
        </a>
      </div>
    `);
  });
});
