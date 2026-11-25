export default function decorate(block) {
  [...block.children].forEach((row) => {
    const picture = row.querySelector('picture, img');
    const link = row.querySelector('a[href]');
    if (!picture || !link || !['http:', 'https:'].includes(link.protocol)) {
      // eslint-disable-next-line no-console
      console.warn('Social Links: configura una imagen y una URL HTTP(S).', row);
      return;
    }

    const text = link.textContent.trim();
    const label = document.createElement('span');
    label.className = 'social-links-label';
    label.textContent = text === link.getAttribute('href') ? link.hostname : text || link.hostname;
    const icon = document.createElement('span');
    icon.className = 'social-links-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.append(picture);

    link.textContent = '';
    link.removeAttribute('title');
    link.className = 'social-links-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(icon, label);
    row.replaceChildren(link);
    row.classList.add('social-links-item');
  });
}
