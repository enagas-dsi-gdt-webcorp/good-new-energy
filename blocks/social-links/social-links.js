export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [iconCell, linkCell, imageCell] = row.children;
    const iconValue = iconCell?.textContent.trim();
    const link = linkCell?.querySelector('a[href]');
    const picture = imageCell?.querySelector('picture, img');
    const isGlyph = [...(iconValue || '')].length === 1
      && iconValue.codePointAt(0) >= 0xe000 && iconValue.codePointAt(0) <= 0xf8ff;
    if (!link || !['http:', 'https:'].includes(link.protocol) || !link.textContent.trim()
      || (!isGlyph && !(iconValue === 'image' && picture))) {
      // eslint-disable-next-line no-console
      console.warn('Social Links: configura un icono, una URL HTTP(S) y un nombre accesible.', row);
      return;
    }

    const label = document.createElement('span');
    label.className = 'social-links-label';
    while (link.firstChild) label.append(link.firstChild);
    const icon = document.createElement('span');
    icon.className = 'social-links-icon';
    icon.setAttribute('aria-hidden', 'true');
    if (isGlyph) {
      icon.textContent = iconValue;
    } else {
      icon.classList.add('social-links-image');
      icon.append(picture);
    }
    iconCell.hidden = true;
    if (imageCell) imageCell.hidden = true;
    link.classList.add('social-links-link');
    link.append(icon, label);
    row.classList.add('social-links-item');
  });
}
