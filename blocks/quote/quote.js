export default function decorate(block) {
  const [textRow, marginRow] = block.children;
  const margin = marginRow?.textContent.trim();
  if (margin) {
    const value = Number(margin);
    if (Number.isFinite(value) && value >= 0) {
      block.style.setProperty('--quote-margin-left', `${value}px`);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Quote: margen izquierdo no válido "${margin}"; se utilizarán 300 px.`);
    }
  }
  if (marginRow) marginRow.hidden = true;
  if (textRow) {
    const quote = document.createElement('blockquote');
    textRow.before(quote);
    quote.append(textRow);
  }
}
