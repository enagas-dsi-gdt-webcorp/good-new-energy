import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const socialDomains = {
  'linkedin.com': 'linkedin',
  'instagram.com': 'instagram',
  'facebook.com': 'facebook',
  'youtube.com': 'youtube',
  'twitter.com': 'x',
  'x.com': 'x',
};

function decorateSocialLinks(footer) {
  footer.querySelectorAll('.columns > div > div > p > a[href]').forEach((link) => {
    const paragraph = link.parentElement;
    const label = link.textContent.trim();
    if (!label || link.querySelector('img') || paragraph.children.length !== 1
      || paragraph.textContent.trim() !== label) return;

    const host = link.hostname.toLowerCase();
    const domain = Object.keys(socialDomains).find((name) => host === name || host.endsWith(`.${name}`));
    if (!domain) return;
    const network = socialDomains[domain];
    const next = paragraph.nextElementSibling;
    const picture = next?.matches('picture') ? next : null;
    const decorativePicture = picture?.querySelector('img')?.getAttribute('alt') === '';
    if (network === 'x' && !decorativePicture) return;

    const text = document.createElement('span');
    text.className = 'footer-social-label';
    while (link.firstChild) text.append(link.firstChild);
    const icon = document.createElement('span');
    icon.className = `footer-social-icon footer-social-icon-${network}`;
    icon.setAttribute('aria-hidden', 'true');
    if (network === 'x') icon.append(picture);
    else if (decorativePicture) picture.hidden = true;
    link.classList.remove('button', 'primary', 'secondary', 'accent');
    paragraph.classList.remove('button-wrapper', 'button-container');
    paragraph.classList.add('footer-social-item');
    link.classList.add('footer-social-link');
    link.append(icon, text);
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

  footer.querySelectorAll('.columns > div').forEach((row) => {
    [...row.children].forEach((column, index) => {
      column.classList.add(`footer-column-${index + 1}`);
    });
  });

  decorateSocialLinks(footer);
  block.append(footer);
}
