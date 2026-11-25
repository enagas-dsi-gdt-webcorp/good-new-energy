export function isIconGlyph(value) {
  return [...value].length === 1 && value.codePointAt(0) >= 0xe000
    && value.codePointAt(0) <= 0xf8ff;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    const iconValue = [...row.children].map((cell) => cell.textContent.trim()).find(isIconGlyph);
    const link = row.querySelector('a[href]');
    if (!iconValue || !link || !['http:', 'https:'].includes(link.protocol)) {
      // eslint-disable-next-line no-console
      console.warn('Social Links: configura un icono y una URL HTTP(S).', row);
      return;
    }

    const text = link.textContent.trim();
    const label = document.createElement('span');
    label.className = 'social-links-label';
    label.textContent = text === link.getAttribute('href') ? link.hostname : text || link.hostname;
    const icon = document.createElement('span');
    icon.className = 'social-links-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = iconValue;

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
