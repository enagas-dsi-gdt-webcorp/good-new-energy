function readSeconds(row, fallback, allowZero = false) {
  const value = row?.textContent.trim();
  if (!value) return fallback;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && (allowZero ? seconds >= 0 : seconds > 0)
    && seconds <= 2147483) return seconds;
  // eslint-disable-next-line no-console
  console.warn(`Slider: tiempo no válido "${value}"; se utilizará ${fallback} segundos.`);
  return fallback;
}

function decorateSlide(row, index, total) {
  const [image, title, subtitle, color] = row.children;
  row.classList.add('slider-slide');
  row.setAttribute('role', 'group');
  row.setAttribute('aria-roledescription', 'diapositiva');
  row.setAttribute('aria-label', `${index + 1} de ${total}`);
  if (image) {
    image.classList.add('slider-image');
    const img = image.querySelector('img');
    if (img && index > 0) img.loading = 'lazy';
  }
  const content = document.createElement('div');
  content.className = 'slider-content';
  if (title) {
    title.classList.add('slider-title');
    const text = title.querySelector('p, h1, h2, h3, h4, h5, h6') || title;
    const heading = document.createElement('h2');
    while (text.firstChild) heading.append(text.firstChild);
    if (text === title) title.append(heading);
    else {
      [...text.attributes].forEach(({ name, value }) => heading.setAttribute(name, value));
      text.replaceWith(heading);
    }
    content.append(title);
  }
  if (subtitle) {
    subtitle.classList.add('slider-subtitle');
    content.append(subtitle);
  }
  const accent = color?.textContent.trim();
  if (accent && /^#[\da-f]{3}([\da-f]{3})?$/i.test(accent)) {
    row.style.setProperty('--slider-accent', accent);
  } else if (accent) {
    // eslint-disable-next-line no-console
    console.warn(`Slider: color no válido "${accent}"; se utilizará el color predeterminado.`);
  }
  if (color) color.hidden = true;
  row.append(content);
}

export default function decorate(block) {
  const [intervalRow, transitionRow, ...slides] = [...block.children];
  const interval = readSeconds(intervalRow, 5) * 1000;
  const transition = readSeconds(transitionRow, 0.8, true);
  if (intervalRow) intervalRow.hidden = true;
  if (transitionRow) transitionRow.hidden = true;
  if (!slides.length) return;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carrusel');
  block.setAttribute('aria-label', 'Contenido destacado');
  block.style.setProperty('--slider-transition', `${transition}s`);

  const viewport = document.createElement('div');
  viewport.className = 'slider-viewport';
  slides.forEach((slide, index) => {
    decorateSlide(slide, index, slides.length);
    viewport.append(slide);
  });
  block.append(viewport);
  if (slides.length === 1) return;

  const controls = document.createElement('div');
  controls.className = 'slider-controls';
  const navigation = document.createElement('div');
  navigation.className = 'slider-navigation';
  navigation.setAttribute('role', 'group');
  navigation.setAttribute('aria-label', 'Seleccionar diapositiva');
  const status = document.createElement('p');
  status.className = 'slider-status';
  status.setAttribute('aria-live', 'polite');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'slider-toggle';

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !motion.matches;
  let hovered = false;
  let current = 0;
  let timer;
  let pointerPlaying;
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slider-dot';
    button.setAttribute('aria-label', `Mostrar diapositiva ${index + 1} de ${slides.length}`);
    navigation.append(button);
    return button;
  });

  function show(index, announce = false) {
    current = index;
    slides.forEach((slide, i) => {
      slide.style.setProperty('--slider-offset', `${(i - current) * 100}%`);
      slide.setAttribute('aria-hidden', String(i !== current));
      slide.inert = i !== current;
      buttons[i].setAttribute('aria-pressed', String(i === current));
    });
    if (announce) status.textContent = `Diapositiva ${current + 1} de ${slides.length}`;
  }

  function schedule() {
    window.clearTimeout(timer);
    if (playing && !hovered && !document.hidden) {
      timer = window.setTimeout(() => {
        show((current + 1) % slides.length);
        schedule();
      }, interval);
    }
  }

  function updateToggle() {
    toggle.textContent = playing ? 'Pausar' : 'Reproducir';
    toggle.setAttribute('aria-label', playing ? 'Pausar carrusel' : 'Reproducir carrusel');
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      show(index, true);
      schedule();
    });
  });
  toggle.addEventListener('pointerdown', () => {
    pointerPlaying = playing;
  });
  toggle.addEventListener('click', (event) => {
    playing = !((event.detail ? pointerPlaying : undefined) ?? playing);
    pointerPlaying = undefined;
    updateToggle();
    schedule();
  });
  block.addEventListener('focusin', (event) => {
    if (!block.contains(event.relatedTarget) && playing) {
      playing = false;
      updateToggle();
      schedule();
    }
  });
  block.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  block.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', (event) => {
    if (event.matches) {
      playing = false;
      updateToggle();
      schedule();
    }
  });

  controls.append(navigation, toggle);
  block.append(controls, status);
  show(0);
  updateToggle();
  schedule();
}
