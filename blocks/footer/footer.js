import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function getImage(element) {
  if (element.matches('picture, img')) return element;
  if (element.matches('p') && !element.textContent.trim() && element.children.length === 1) {
    return element.querySelector(':scope > picture, :scope > img');
  }
  return null;
}

function getLink(element) {
  if (!element?.matches('p') || element.children.length !== 1) return null;
  const link = element.firstElementChild;
  return link.matches('a[href]') && link.textContent.trim() === element.textContent.trim()
    ? link : null;
}

// the delivery flattens a nested Social Links block into image + link paragraphs
function decorateIconLinks(footer) {
  footer.querySelectorAll('.columns > div > div').forEach((column) => {
    [...column.children].forEach((element) => {
      const image = getImage(element);
      const linkParagraph = element.nextElementSibling;
      const link = image && getLink(linkParagraph);
      if (!link || !['http:', 'https:'].includes(link.protocol)) return;

      const text = link.textContent.trim();
      const label = document.createElement('span');
      label.className = 'footer-icon-label';
      label.textContent = text === link.getAttribute('href') ? link.hostname : text;
      link.textContent = '';
      link.removeAttribute('title');
      link.className = 'footer-icon-link';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      element.before(link);
      link.append(image, label);
      if (element !== image) element.remove();
      linkParagraph.remove();
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  decorateIconLinks(footer);

  footer.querySelectorAll('.columns > div').forEach((row) => {
    [...row.children].forEach((column, index) => {
      column.classList.add(`footer-column-${index + 1}`);
    });
  });

  block.append(footer);
}
