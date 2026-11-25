import { loadBlock } from '../../scripts/aem.js';

const nestedBlocks = ['social-links'];

export default function decorate(block) {
  // blocks nested in a cell are not decorated by the page loader
  nestedBlocks.forEach((name) => {
    block.querySelectorAll(`.${name}`).forEach((nested) => {
      nested.classList.add('block');
      nested.dataset.blockName = name;
      nested.dataset.blockStatus = 'initialized';
      loadBlock(nested);
    });
  });

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture:not(.social-links picture)');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
