/* global WebImporter */

const SOURCE_HOST = 'goodnewenergy.enagas.es';

function sourceURL(url, params) {
  return new URL(params?.originalURL || url);
}

function normalizeURLs(root, source) {
  root.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('data-src') || image.getAttribute('src');
    if (src && !src.startsWith('data:')) image.setAttribute('src', new URL(src, source).href);
    image.removeAttribute('srcset');
    image.removeAttribute('sizes');
  });

  root.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) return;
    const target = new URL(href, source);
    if (target.hostname === SOURCE_HOST
      && !target.pathname.startsWith('/wp-')
      && !target.search) {
      link.setAttribute('href', `${target.pathname}${target.hash}`);
    } else {
      link.setAttribute('href', target.href);
    }
  });
}

function imageFromBackground(element, document, source) {
  const background = element?.style.backgroundImage;
  const match = background?.match(/url\(["']?([^"')]+)["']?\)/);
  if (!match) return null;
  const image = document.createElement('img');
  image.src = new URL(match[1], source).href;
  image.alt = '';
  return image;
}

function addIntro(main, document, source) {
  const intro = document.querySelector('section.intro, section.intro-page');
  if (!intro) return;
  const title = intro.querySelector('h1');
  const subtitle = intro.querySelector('.grupo > p');
  const image = intro.querySelector('.intro-image') || imageFromBackground(intro, document, source);
  if (!title) throw new Error('The page introduction has no title.');

  if (!image) {
    main.append(title);
    if (subtitle) main.append(subtitle);
    return;
  }

  const text = document.createElement('div');
  text.append(title);
  if (subtitle) text.append(subtitle);
  main.append(WebImporter.DOMUtils.createTable([
    ['Hero'],
    [image],
    [text],
  ], document));
  main.append(document.createElement('hr'));
}

function addCards(main, document, items) {
  const rows = [...items].map((item) => {
    const image = item.querySelector('.imagen img');
    const info = item.querySelector('.info');
    if (!info?.querySelector('h2 a')) {
      throw new Error('An article listing item has no linked title.');
    }
    return [image || '', info];
  });
  if (rows.length) main.append(WebImporter.DOMUtils.createTable([['Cards'], ...rows], document));
}

function addSlides(main, document) {
  const slides = [...document.querySelectorAll('.n2-ss-slide[data-slide-public-id]')];
  if (!slides.length) return;
  const rows = slides.map((slide) => {
    const id = slide.getAttribute('data-slide-public-id');
    const image = document.querySelector(`.n2-ss-slide-background[data-public-id="${id}"] img`);
    const heading = slide.querySelector('h2, h3');
    const href = slide.getAttribute('data-href');
    if (!heading || !href) throw new Error(`Slider item ${id} is missing a title or link.`);
    const text = document.createElement('div');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = heading.textContent.trim();
    heading.replaceChildren(link);
    text.append(heading);
    const description = slide.querySelector('.n2-ss-item-content p');
    if (description) text.append(description);
    return [image || '', text];
  });
  main.append(WebImporter.DOMUtils.createTable([['Cards'], ...rows], document));
  main.append(document.createElement('hr'));
}

function preserveEmbeds(root, document, source) {
  root.querySelectorAll('iframe[src], video[src], video source[src]').forEach((embed) => {
    const link = document.createElement('a');
    link.href = new URL(embed.getAttribute('src'), source).href;
    link.textContent = embed.getAttribute('title') || link.href;
    const paragraph = document.createElement('p');
    paragraph.append(link);
    const container = embed.closest('video') || embed;
    container.replaceWith(paragraph);
  });
}

function addMetadata(main, document, source) {
  const value = (selector) => document.querySelector(selector)?.getAttribute('content')?.trim();
  const metadata = {
    Title: document.querySelector('title')?.textContent.trim(),
    Description: value('meta[name="description"]') || value('meta[property="og:description"]'),
    author: value('meta[name="author"]'),
    publicationDate: value('meta[property="article:published_time"]'),
    lastModified: value('meta[property="article:modified_time"]'),
  };
  const image = value('meta[property="og:image"]');
  if (image) {
    const element = document.createElement('img');
    element.src = new URL(image, source).href;
    element.alt = '';
    metadata.image = element;
  }
  Object.keys(metadata).forEach((key) => {
    if (!metadata[key]) delete metadata[key];
  });
  if (Object.keys(metadata).length) {
    main.append(document.createElement('hr'));
    main.append(WebImporter.Blocks.getMetadataBlock(document, metadata));
  }
}

export default {
  transformDOM: ({ document, url, params }) => {
    const source = sourceURL(url, params);
    const main = document.createElement('main');
    const content = document.querySelector('section.interior-articulo .contenido');
    const listing = document.querySelector('.listado-post');
    const homeTitle = document.querySelector('section.contenedor > h1');

    if (!content && !listing) {
      throw new Error(`Unsupported page structure: ${source.href}`);
    }

    addIntro(main, document, source);
    if (homeTitle && !main.querySelector('h1')) main.append(homeTitle);
    addSlides(main, document);
    if (content) {
      content.querySelectorAll('script, style, noscript, .compartir').forEach((el) => el.remove());
      content.querySelectorAll('blockquote').forEach((quote) => {
        const container = document.createElement('div');
        container.append(...quote.childNodes);
        quote.replaceWith(container);
      });
      preserveEmbeds(content, document, source);
      main.append(content);
    }
    if (listing) addCards(main, document, listing.querySelectorAll('article'));
    normalizeURLs(main, source);
    addMetadata(main, document, source);
    return main;
  },

  generateDocumentPath: ({ url, params }) => {
    const { pathname } = sourceURL(url, params);
    const path = pathname.replace(/\/+$/, '').replace(/\.html$/i, '') || '/index';
    return WebImporter.FileUtils.sanitizePath(path);
  },
};
