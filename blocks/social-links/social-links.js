export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [imageCell, linkCell] = row.children;
    const picture = imageCell?.querySelector('picture, img');
    const link = linkCell?.querySelector('a[href]');
    if (!picture || !link || !['http:', 'https:'].includes(link.protocol)
      || !link.textContent.trim()) {
      // eslint-disable-next-line no-console
      console.warn('Social Links: configura una imagen, una URL HTTP(S) y un nombre accesible.', row);
      return;
    }

    const label = document.createElement('span');
    label.className = 'social-links-label';
    while (link.firstChild) label.append(link.firstChild);
    const icon = document.createElement('span');
    icon.className = 'social-links-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.append(picture);
    imageCell.hidden = true;
    link.classList.add('social-links-link');
    link.append(icon, label);
    row.classList.add('social-links-item');
  });
}
