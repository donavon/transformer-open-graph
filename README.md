# transformer-open-graph

A transformer for [`@remark-embedder/core`](https://github.com/remark-embedder/core) that extracts Open Graph metadata from a URL and create an HTML preview.

- Works with [`@remark-embedder/core`](https://github.com/remark-embedder/core)
- Supports Twitter Cards and Open Graph
- Powered by [Open Graph Ninja](https://opengraph.ninja/)'s API
- 100% test coverage
- Written in TypeScript and fully typed
- Awesome! 🎉

Want to see an example? Check out [https://donavon.com/blog/markdown#social-links](https://donavon.com/blog/markdown#social-links)

## Usage

```ts
import remarkEmbedder from '@remark-embedder/core';
import transformerOpenGraph from 'transformer-open-graph';
import remark from 'remark';
import html from 'remark-html';

const exampleMarkdown = `
This is my website:

https://donavon.com
`;

async function go() {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [transformerOpenGraph],
    })
    .use(html)
    .process(exampleMarkdown);

  console.log(result.toString());
  // logs:
  // <p>This is my website:</p>
  // <div class="ogn-outer-container">
  //   <a class="ogn-container" href="https://donavon.com/" target="_blank" rel="noopener noreferrer" data-twitter-card="summary">
  //     <img class="ogn-image" src="https://donavon.com/img/donavon-avatar.jpeg" alt="Donavon West's website">
  //     <div class="ogn-content">
  //       <p class="ogn-content-title">Donavon West's website</p>
  //       <p class="ogn-content-description">Donavon West is a full-stack software engineer living in the New York City area.</p>
  //       <p class="ogn-content-url">donavon.com</p>
  //     </div>
  //   </a>
  // </div>
}

go();
```

## Example output

You'll need to B.Y.O. CSS, but you can get beautiful web page preview output like this.

![sample screen](./docs/example.png?raw=true)

## Getting Started

Install the library with your package manager of choice, e.g.:

```
$ npm i transformer-open-graph
# or
$ yarn add transformer-open-graph
```

## License

&copy; 2022 Donavon West. Released under [MIT license](./LICENSE).
