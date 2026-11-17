import { gsap } from 'gsap';
import { chords, projects, tuning, type ProjectKey } from '../data/site';
import { StringAudio } from './audio';
import { boot, ease, onPage, reducedMotion } from './engine';
import { withBase } from '../lib/url';
type AppEvents = WindowEventMap & DocumentEventMap;

export function start() {
  onPage(() => {
    const home = document.getElementById('home')!;
    const instrument = document.querySelector<HTMLElement>('[data-instrument]')!;
    const board = document.getElementById('fretboard')!;
    const world = document.querySelector<HTMLElement>('[data-world]')!;
    const casePage = document.getElementById('project')!;
    const transition = document.querySelector<HTMLElement>('[data-transition]')!;
    const scenes = [...document.querySelectorAll<HTMLElement>('[data-scene]')];
    const nodes = [...document.querySelectorAll<HTMLElement>('.project-node')];
    const paths = [...document.querySelectorAll<SVGPathElement>('[data-string]')];
    const shadows = [...document.querySelectorAll<SVGPathElement>('[data-string-shadow]')];
    const highlights = [...document.querySelectorAll<SVGPathElement>('[data-string-highlight]')];
    const windings = [...document.querySelectorAll<SVGPathElement>('[data-string-winding]')];
    const info = document.querySelector<HTMLElement>('.project-info')!;
    const soundButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-sound]')];
    const about = document.getElementById('about-dialog') as HTMLDialogElement;
    const indexDialog = document.getElementById('index-dialog') as HTMLDialogElement;
    const title = document.querySelector<HTMLElement>('[data-project-title]')!;
    const category = document.querySelector<HTMLElement>('[data-project-category]')!;
    const year = document.querySelector<HTMLElement>('[data-project-year]')!;
    const action = document.querySelector<HTMLElement>('[data-project-action]')!;
    const chapter = document.querySelector<HTMLElement>('[data-chapter]')!;
    const chordName = document.querySelector<HTMLElement>('[data-chord-name]')!;
    const chordDescription = document.querySelector<HTMLElement>('[data-chord-description]')!;
    const previousButton = document.querySelector<HTMLButtonElement>('[data-prev]')!;
    const nextButton = document.querySelector<HTMLButtonElement>('[data-next]')!;
    const announce = document.querySelector<HTMLElement>('[data-announcement]')!;
    const toastElement = document.querySelector<HTMLElement>('[data-toast]')!;
    const themeButton = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!;
    const zoomButton = document.querySelector<HTMLButtonElement>('[data-zoom]')!;
    const services = [...document.querySelectorAll<HTMLElement>('[data-service]')];
    const audio = new StringAudio();
    const abort = new AbortController();
    const listen = <K extends keyof AppEvents>(target: EventTarget, event: K, handler: (event: AppEvents[K]) => void, options: AddEventListenerOptions = {}) => {
      target.addEventListener(event, handler as EventListener, { ...options, signal: abort.signal });
    };

    let width = innerWidth;
    let height = innerHeight;
    let position = 0;
    let target = 0;
    let scene = -1;
    let lastInput = 0;
    let needsSnap = false;
    let pointerX = width * .5;
    let previousY: number | null = null;
    let previousX: number | null = null;
    let previousPointerTime = 0;
    let dragging = false;
    let dragStartX = 0;
    let dragStartPosition = 0;
    let isProject = document.documentElement.dataset.initialProject === 'true';
    let desiredProject = isProject;
    let busy = false;
    let firstInteraction = false;
    let sourcePoint: { x: number; y: number; radius: number } | null = null;
    let sourceNode: HTMLElement | null = null;
    let metaKey: ProjectKey | null = null;
    let toastTween: gsap.core.Timeline | null = null;
    let smoothedSpeed = 0;
    let lastAudioUpdate = 0;
    let noteSize = 400;
    let dotSize = 56;
    let stringSpread = 76;
    let fretStep = width * .235;
    let neckAngle = .3;
    let focusX = width * .58;
    let focusY = height * .49;
    let overview = false;
    const chapterSpacing = 1.55;
    let overviewScale = .2;
    let overviewX = 0;
    let overviewY = 0;
    const zoom = { value: 0 };
    let arranging = false;
    const setWorldX = gsap.quickSetter(world, 'x', 'px');
    gsap.set(world, { transformOrigin: '0 0' });
    const motions = nodes.map(node => ({ node, row: Number(node.dataset.row), section: Number(node.dataset.sceneId), baseY: 0, slot: 0, setY: gsap.quickSetter(node.querySelector('.note-motion'), 'y', 'px'), setTurn: gsap.quickSetter(node, 'rotationY', 'deg') }));
    const strings = Array.from({ length: 4 }, () => ({ amplitude: 0, at: 0, pluckX: .5, last: -1 }));

    if (!isProject) history.replaceState({ ...history.state, fretboard: true }, '', location.href);

    function soundState() {
      document.body.dataset.sound = audio.enabled ? 'on' : 'off';
      soundButtons.forEach(button => {
        button.setAttribute('aria-pressed', String(audio.enabled));
        button.querySelector('[data-sound-label]')!.textContent = audio.enabled ? 'Sound on' : 'Sound off';
      });
    }
    async function unlock() {
      try { await audio.enable(); soundState(); }
      catch { audio.mute(); soundState(); }
    }
    function stringY(x: number, row: number) {
      const sag = (Math.sin(Math.PI * x) - Math.sin(Math.PI * focusX / width)) * 12;
      return focusY - Math.tan(neckAngle) * (x * width - focusX) + (row - 1) * stringSpread / Math.cos(neckAngle) + sag;
    }
    function layoutNotes() {
      stringSpread = Math.min(height * .09, 82);
      fretStep = width * .30;
      focusX = width * .58;
      focusY = height * .49;
      neckAngle = Math.asin(gsap.utils.clamp(.12, .34, (height * .5 - 70 - 2 * stringSpread) / (2 * fretStep)));
      noteSize = Math.max(150, Math.min(width * .30, height * .52, 570, (Math.hypot(fretStep, stringSpread) - 24) / .95));
      dotSize = noteSize * .70;
      world.style.setProperty('--chapter-spacing', String(chapterSpacing));
      motions.forEach(item => {
        const chord = chords[item.section];
        const anchorFret = chord.frets[chord.mainRow];
        const dx = (chord.frets[item.row] - anchorFret) * fretStep;
        const normal = (item.row - chord.mainRow) * stringSpread;
        item.slot = (focusX + dx * Math.cos(neckAngle) + normal * Math.sin(neckAngle)) / width;
        item.baseY = stringY(item.slot, item.row);
        item.node.style.left = `${item.slot * width}px`;
        item.node.style.top = `${item.baseY}px`;
        item.node.style.width = `${item.row === chord.mainRow ? noteSize : dotSize}px`;
        item.node.style.height = `${item.row === chord.mainRow ? noteSize : dotSize}px`;
      });
      const bounds = motions.map(item => {
        const x = (item.slot + item.section * chapterSpacing) * width;
        const radius = (item.row === chords[item.section].mainRow ? noteSize : dotSize) * .53;
        const y = stringY(x / width, item.row);
        return { left: x - radius, right: x + radius, top: y - radius, bottom: y + radius + 28 };
      });
      const minX = Math.min(...bounds.map(b => b.left));
      const maxX = Math.max(...bounds.map(b => b.right));
      const minY = Math.min(...bounds.map(b => b.top));
      const maxY = Math.max(...bounds.map(b => b.bottom));
      const padding = Math.min(width * .05, 64);
      const availableHeight = Math.max(100, height - 210);
      overviewScale = Math.min((width - padding * 2) / (maxX - minX), availableHeight / (maxY - minY), .5);
      overviewX = (width - (maxX - minX) * overviewScale) / 2 - minX * overviewScale;
      overviewY = 113 + (availableHeight - (maxY - minY) * overviewScale) / 2 - minY * overviewScale + Math.tan(neckAngle) * overviewX;
    }
    function toast(message: string) {
      toastElement.textContent = message;
      toastTween?.kill();
      toastTween = gsap.timeline().to(toastElement, { opacity: 1, y: -8, duration: .2 }).to(toastElement, { opacity: 0, y: 0, duration: .3 }, '+=1.8');
    }
    function setMeta(key: ProjectKey) {
      if (metaKey === key) return;
      metaKey = key;
      const item = projects[key];
      title.textContent = item.title;
      category.textContent = item.category;
      year.textContent = item.year;
      action.textContent = item.ready ? 'View ↗' : 'Preview';
    }
    function updateScene(value: number) {
      if (scene === value) return;
      scene = value;
      const chord = chords[value];
      document.body.dataset.chord = chord.name;
      document.body.dataset.section = String(value);
      scenes.forEach((element, i) => { element.inert = !overview && i !== value; element.setAttribute('aria-hidden', String(!overview && i !== value)); });
      chapter.textContent = String(value + 1).padStart(2, '0');
      chordName.textContent = chord.name;
      chordDescription.textContent = chord.description;
      audio.setChord(tuning.map((frequency, row) => frequency * 2 ** (chord.frets[row] / 12)));
      previousButton.disabled = value === 0;
      nextButton.disabled = value === chords.length - 1;
      setMeta(chord.project);
      if (value >= 0) announce.textContent = `Chord ${value + 1} of ${chords.length}: ${chord.name}. ${chord.description}.`;
    }
    function goTo(value: number) {
      target = gsap.utils.clamp(0, chords.length - 1, value);
      needsSnap = false;
      if (reducedMotion()) { position = target; setWorldX(-position * width * chapterSpacing); updateScene(Math.round(position)); }
    }
    function setOverview(value: boolean) {
      overview = value;
      document.body.dataset.overview = String(value);
      zoomButton.setAttribute('aria-pressed', String(value));
      zoomButton.textContent = value ? 'Zoom in' : 'Zoom out';
      scenes.forEach((element, i) => { element.inert = !value && i !== scene; element.setAttribute('aria-hidden', String(!value && i !== scene)); });
      gsap.to(zoom, { value: value ? 1 : 0, duration: reducedMotion() ? .05 : .9, ease: ease.inOut, overwrite: true });
    }
    function pluck(row: number, x = .5, strength = 1, note = true, delay = 0) {
      const string = strings[row];
      const time = gsap.ticker.time;
      if (note && delay === 0 && time - string.last < .085) return;
      string.amplitude = Math.min(45, 24 * strength);
      string.at = time + delay;
      string.pluckX = gsap.utils.clamp(.08, .92, x);
      string.last = time;
      const chord = chords[Math.max(0, scene)];
      if (note) audio.note(tuning[row] * 2 ** (chord.frets[row] / 12), row, delay, strength * .85);
    }
    function strum() { for (let row = 0; row < 4; row++) pluck(row, .56, .8, true, row * .065); }
    function displacement(row: number, x: number, time: number) {
      if (reducedMotion()) return 0;
      const string = strings[row];
      const age = time - string.at;
      if (age < 0 || age > 2.2 || !string.amplitude) return 0;
      const damping = Math.exp(-age * 3.2);
      let wave = 0;
      for (let mode = 1; mode <= 4; mode++) wave += Math.sin(mode * Math.PI * x) * Math.sin(mode * Math.PI * string.pluckX) * Math.sin(age * (35 + row * 3) * mode) / (mode * mode);
      return wave * damping * string.amplitude;
    }
    const tick = (time: number, deltaTime: number) => {
      if (document.hidden) return;
      if (isProject || busy) { if (smoothedSpeed !== 0) { audio.setMotion(0); smoothedSpeed = 0; } return; }
      if (needsSnap && !dragging && performance.now() - lastInput > 170) { target = Math.round(target); needsSnap = false; }
      const mix = reducedMotion() ? 1 : 1 - Math.exp(-Math.min(deltaTime, 64) / 85);
      const previousPosition = position;
      position += (target - position) * mix;
      const speed = Math.abs(position - previousPosition) / Math.max(.008, deltaTime / 1000);
      smoothedSpeed += (speed - smoothedSpeed) * .14;
      if (time - lastAudioUpdate > .065) { audio.setMotion(smoothedSpeed); lastAudioUpdate = time; }
      document.body.dataset.motion = smoothedSpeed > .03 ? 'moving' : 'resting';
      if (Math.abs(target - position) < .0001) position = target;
      const viewScale = 1 + (overviewScale - 1) * zoom.value;
      const viewX = -position * width * chapterSpacing * (1 - zoom.value) + overviewX * zoom.value;
      const camera = -viewX / (width * viewScale);
      const viewY = overviewY * zoom.value;
      gsap.set(world, {
        x: viewX,
        y: viewY,
        scale: viewScale,
      });
      if (!overview) updateScene(Math.round(position));
      paths.forEach((path, row) => {
        let d = '';
        for (let point = 0; point <= 64; point++) {
          const screenX = point / 64;
          const x = screenX / viewScale;
          const irregularity = Math.sin(x * 47 + row * 6.7) * .12;
          const y = (stringY(x, row) + irregularity + displacement(row, Math.min(1, x), time)) * viewScale + viewY;
          d += `${point ? 'L' : 'M'}${(screenX * width).toFixed(1)},${y.toFixed(2)} `;
        }
        path.setAttribute('d', d);
        shadows[row].setAttribute('d', d);
        highlights[row].setAttribute('d', d);
        windings[row].setAttribute('d', d);
      });
      motions.forEach(item => {
        const x = item.slot + item.section * chapterSpacing - camera;
        item.setY(stringY(x, item.row) - item.baseY + (x >= 0 && x <= 1 ? displacement(item.row, x, time) * .68 : 0));
        if (!reducedMotion()) item.setTurn(gsap.utils.clamp(-16, 16, (target - position) * -35));
      });
      services.forEach((element, row) => {
        const x = [.20, .43, .67, .82][row];
        const y = stringY(x, row);
        const mid = Math.sin(Math.PI * (position % 1));
        const covered = motions.some(item => {
          const centre = (item.slot + (item.section - position) * chapterSpacing) * width;
          const radius = (item.node.hasAttribute('data-main-note') ? noteSize : dotSize) / 2;
          return Math.abs(centre - x * width) < radius + 75 && Math.abs(stringY(centre / width, item.row) - y) < radius + 14;
        });
        element.style.left = `${x * width}px`;
        element.style.top = `${y}px`;
        element.style.rotate = `${-neckAngle * 180 / Math.PI}deg`;
        element.style.opacity = String(!overview && !covered && smoothedSpeed > .04 ? Math.pow(mid, 2) * Math.min(1, smoothedSpeed * 3) : 0);
      });
    };

    function sourceGeometry(source?: HTMLElement) {
      const node = source || sourceNode || nodes.find(node => node.dataset.project === 'nba' && Number(node.dataset.sceneId) === scene);
      const rect = node?.querySelector('.disc')?.getBoundingClientRect() || node?.getBoundingClientRect();
      if (rect && rect.left > -rect.width && rect.left < width) return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: Math.min(rect.width, rect.height) / 2 };
      return sourcePoint || { x: width * .5, y: height * .5, radius: 50 };
    }
    async function reconcileProject() {
      if (busy || desiredProject === isProject) return;
      busy = true;
      const opening = desiredProject;
      const point = sourceGeometry();
      const maxRadius = Math.hypot(width, height) * 1.1;
      if (opening) {
        home.inert = true;
        gsap.set(transition, { visibility: 'visible', opacity: 1, clipPath: `circle(${point.radius}px at ${point.x}px ${point.y}px)` });
        await gsap.to(transition, { clipPath: `circle(${maxRadius}px at ${point.x}px ${point.y}px)`, duration: reducedMotion() ? .12 : .88, ease: ease.inOut });
        casePage.hidden = false;
        casePage.inert = false;
        casePage.scrollTop = 0;
        home.hidden = true;
        document.body.classList.add('case-open');
        document.title = 'BUDX NBA House | 4/4 Experiences';
        isProject = true;
        await gsap.to(transition, { opacity: 0, duration: .18 });
        gsap.set(transition, { visibility: 'hidden' });
        if (!reducedMotion()) gsap.from('.case-title-group > *', { y: 32, opacity: 0, stagger: .065, duration: .85, ease: ease.out, clearProps: 'all' });
        document.getElementById('project-heading')!.focus({ preventScroll: true });
        announce.textContent = 'BUDX NBA House project breakdown opened.';
      } else {
        gsap.set(transition, { visibility: 'visible', opacity: 0, clipPath: `circle(${maxRadius}px at ${point.x}px ${point.y}px)` });
        await gsap.to(transition, { opacity: 1, duration: reducedMotion() ? .05 : .2 });
        home.hidden = false;
        home.inert = false;
        casePage.hidden = true;
        casePage.inert = true;
        document.body.classList.remove('case-open');
        document.title = '4/4 Experiences | Work in four strings';
        setWorldX(-position * width * chapterSpacing);
        isProject = false;
        await gsap.to(transition, { clipPath: `circle(${point.radius}px at ${point.x}px ${point.y}px)`, duration: reducedMotion() ? .1 : .75, ease: ease.inOut });
        gsap.set(transition, { visibility: 'hidden', opacity: 0 });
        (sourceNode && !sourceNode.closest('[inert]') ? sourceNode : board).focus({ preventScroll: true });
        announce.textContent = `Returned to ${chords[scene].name}.`;
      }
      busy = false;
      if (desiredProject !== isProject) void reconcileProject();
    }
    async function openNBA(source?: HTMLElement) {
      if (busy || isProject) return;
      if (source) { sourceNode = source; sourcePoint = sourceGeometry(source); }
      if (!firstInteraction) { firstInteraction = true; await unlock(); }
      if (audio.context && audio.enabled) await audio.context.resume();
      strum();
      desiredProject = true;
      history.pushState({ fromFretboard: true, section: scene }, '', withBase('/projects/budx-nba-house/'));
      void reconcileProject();
    }
    function backToFretboard() {
      if (history.state?.fromFretboard) history.back();
      else { history.pushState({ fretboard: true }, '', withBase('/')); desiredProject = false; void reconcileProject(); }
    }

    listen(document, 'click', event => {
      const element = event.target as HTMLElement;
      if (firstInteraction || element.closest('[data-sound]')) return;
      firstInteraction = true;
      void unlock();
    }, { capture: true });
    soundButtons.forEach(button => listen(button, 'click', () => {
      firstInteraction = true;
      if (audio.enabled) { audio.mute(); soundState(); }
      else void unlock();
    }));
    nodes.forEach(node => {
      const row = Number(node.dataset.row);
      const key = node.dataset.project as ProjectKey;
      const disc = node.querySelector<HTMLElement>('.disc')!;
      const tilt = Number.parseFloat(node.style.getPropertyValue('--tilt'));
      gsap.set(disc, { rotationX: reducedMotion() ? 0 : 8, rotationY: reducedMotion() ? 0 : -18, rotationZ: reducedMotion() ? 0 : tilt * .5 });
      const enter = () => {
        if (arranging) return;
        if (overview) updateScene(Number(node.dataset.sceneId));
        setMeta(key);
        const rect = node.getBoundingClientRect();
        pluck(row, (rect.left + rect.width / 2) / width, 1);
        node.style.zIndex = '10';
        if (!reducedMotion()) gsap.to(disc, { rotationX: -4, rotationY: 3, rotationZ: 0, scale: 1.035, duration: .85, ease: ease.out, overwrite: true });
      };
      const leave = () => {
        gsap.to(info, { opacity: 0, y: 5, duration: .25, ease: ease.soft, overwrite: true });
        node.style.zIndex = '';
        if (!reducedMotion()) gsap.to(disc, { rotationX: 8, rotationY: -18, rotationZ: tilt * .5, scale: 1, duration: 1.05, ease: ease.out, overwrite: true });
      };
      listen(node, 'pointerenter', enter);
      listen(node, 'focus', enter);
      listen(node, 'pointerleave', leave);
      listen(node, 'blur', leave);
      const rotateX = gsap.quickTo(disc, 'rotationX', { duration: .8, ease: ease.soft });
      const rotateY = gsap.quickTo(disc, 'rotationY', { duration: .8, ease: ease.soft });
      listen(node, 'pointermove', event => {
        if (reducedMotion()) return;
        const rect = node.getBoundingClientRect();
        rotateX((.5 - (event.clientY - rect.top) / rect.height) * 15);
        rotateY(((event.clientX - rect.left) / rect.width - .5) * 22);
        disc.style.setProperty('--light-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
        disc.style.setProperty('--light-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
      });
      listen(node, 'click', event => {
        event.preventDefault();
        if (key === 'nba') void openNBA(node);
        else { strum(); if (overview) { goTo(Number(node.dataset.sceneId)); setOverview(false); } else toast(`${projects[key].title}. Project preview.`); }
      });
    });
    listen(board, 'pointermove', event => {
      if (isProject || busy || about.open || indexDialog.open) return;
      if (overview) return;
      const now = performance.now();
      pointerX = event.clientX;
      if (dragging) { target = gsap.utils.clamp(0, 2, dragStartPosition - (event.clientX - dragStartX) / width); return; }
      if (previousY !== null) {
        const priorY = previousY;
        const priorX = previousX ?? event.clientX;
        const travelled = Math.hypot(event.clientY - priorY, event.clientX - priorX);
        const velocity = travelled / Math.max(1, now - previousPointerTime);
        strings.forEach((_, row) => {
          const baseline = stringY(event.clientX / width, row);
          if ((priorY - stringY(priorX / width, row)) * (event.clientY - baseline) <= 0 && travelled > 1) pluck(row, pointerX / width, gsap.utils.clamp(.5, 1.1, velocity * .3 + .45));
        });
      }
      previousY = event.clientY;
      previousX = event.clientX;
      previousPointerTime = now;
    }, { passive: true });
    listen(board, 'pointerleave', () => { previousY = null; previousX = null; });
    listen(board, 'pointerdown', event => {
      if (isProject || busy || (event.target as HTMLElement).closest('a,button') || event.button !== 0) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartPosition = target;
      board.setPointerCapture(event.pointerId);
      board.style.cursor = 'grabbing';
      let row = 0;
      let distance = Infinity;
      for (let candidate = 0; candidate < 4; candidate++) {
        const nextDistance = Math.abs(event.clientY - stringY(event.clientX / width, candidate));
        if (nextDistance < distance) { row = candidate; distance = nextDistance; }
      }
      if (distance < 45) pluck(row, event.clientX / width, .8);
    });
    const releaseDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      board.style.cursor = '';
      const distance = event.clientX - dragStartX;
      goTo(Math.abs(distance) > 75 ? Math.round(dragStartPosition) + (distance < 0 ? 1 : -1) : Math.round(target));
      if (board.hasPointerCapture(event.pointerId)) board.releasePointerCapture(event.pointerId);
      previousY = null;
    };
    listen(board, 'pointerup', releaseDrag);
    listen(board, 'pointercancel', releaseDrag);
    listen(board, 'wheel', event => {
      if (isProject || busy || about.open || indexDialog.open) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? width : 1;
      const delta = Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      target = gsap.utils.clamp(0, 2, target + delta * unit / (width * chapterSpacing) * 1.55);
      lastInput = performance.now();
      needsSnap = true;
    }, { passive: false });
    listen(previousButton, 'click', () => goTo(scene - 1));
    listen(nextButton, 'click', () => goTo(scene + 1));
    listen(zoomButton, 'click', () => setOverview(!overview));
    listen(document.querySelector('[data-play-chord]')!, 'click', () => { strum(); announce.textContent = `Playing ${chords[scene].name}.`; });
    listen(window, 'keydown', event => {
      if (about.open || indexDialog.open) return;
      if (!firstInteraction && ['Enter', ' ', 'ArrowLeft', 'ArrowRight', '1', '2', '3', '4'].includes(event.key)) { firstInteraction = true; void unlock(); }
      if (event.key === 'Escape' && desiredProject) { event.preventDefault(); backToFretboard(); return; }
      if (isProject || busy || (event.target as HTMLElement).matches('input,textarea,select')) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(scene + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(scene - 1); }
      if (/^[1-4]$/.test(event.key)) { event.preventDefault(); pluck(Number(event.key) - 1, .5, 1.2); }
      if (event.key === ' ' && !(event.target as HTMLElement).closest('a,button')) { event.preventDefault(); strum(); }
    });
    document.querySelectorAll<HTMLElement>('[data-back]').forEach(link => listen(link, 'click', event => { event.preventDefault(); backToFretboard(); }));
    listen(window, 'popstate', () => { desiredProject = location.pathname.includes('/projects/budx-nba-house'); void reconcileProject(); });
    document.querySelectorAll<HTMLElement>('[data-dialog]').forEach(button => listen(button, 'click', () => {
      const dialog = button.dataset.dialog === 'about' ? about : indexDialog;
      dialog.showModal();
      if (!reducedMotion()) gsap.fromTo(dialog, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: ease.out });
    }));
    [about, indexDialog].forEach(dialog => {
      dialog.querySelectorAll('[data-close-dialog]').forEach(button => listen(button, 'click', () => dialog.close()));
      listen(dialog, 'click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
    });
    document.querySelectorAll<HTMLElement>('[data-index-project]').forEach(button => listen(button, 'click', () => {
      const key = button.dataset.indexProject as ProjectKey;
      if (key === 'nba') {
        const image = button.querySelector('img')!.getBoundingClientRect();
        sourcePoint = { x: image.left + image.width / 2, y: image.top + image.height / 2, radius: image.width / 2 };
        sourceNode = null;
        indexDialog.close();
        void openNBA();
      } else {
        indexDialog.close();
        const nextScene = chords.findIndex(chord => chord.project === key);
        if (nextScene >= 0) goTo(nextScene);
        strum();
        setMeta(key);
        toast(`${projects[key].title}. Preview only.`);
      }
    }));
    const resize = () => {
      width = instrument.clientWidth || innerWidth;
      height = instrument.clientHeight || innerHeight;
      layoutNotes();
      paths.forEach((path, row) => { const d = `M0,${stringY(0, row)} L${width},${stringY(1, row)}`; path.setAttribute('d', d); shadows[row].setAttribute('d', d); highlights[row].setAttribute('d', d); windings[row].setAttribute('d', d); });
      setWorldX(-position * width * chapterSpacing);
      if (sourceNode) sourcePoint = sourceGeometry(sourceNode);
      tick(gsap.ticker.time, 16);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(instrument);
    listen(document, 'visibilitychange', () => { if (document.hidden) audio.context?.suspend(); else if (audio.enabled) void audio.context?.resume(); });
    updateScene(0);
    soundState();
    function setTheme(night: boolean) {
      document.documentElement.dataset.theme = night ? 'night' : 'day';
      themeButton.setAttribute('aria-pressed', String(night));
      themeButton.setAttribute('aria-label', night ? 'Switch to day mode' : 'Switch to night mode');
      themeButton.querySelector('[data-theme-label]')!.textContent = night ? 'Day' : 'Night';
      try { localStorage.setItem('four-four-theme', night ? 'night' : 'day'); } catch { /* optional local preference */ }
    }
    let storedNight = true;
    try { storedNight = localStorage.getItem('four-four-theme') !== 'day'; } catch { /* use night */ }
    setTheme(storedNight);
    listen(themeButton, 'click', () => setTheme(document.documentElement.dataset.theme !== 'night'));
    resize();
    gsap.ticker.add(tick);
    if (!reducedMotion() && !isProject) {
      arranging = true;
      document.body.classList.add('arranging');
      const intro = gsap.timeline({ onComplete: () => { arranging = false; document.body.classList.remove('arranging'); } });
      motions.filter(item => item.section === 0).forEach(item => {
        gsap.set(item.node, { x: 0, y: 50, scale: .12, opacity: 0 });
        intro.to(item.node, { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.65, ease: ease.out }, .2);
      });
      intro.to({}, { duration: .15 });
    }
    return () => { abort.abort(); observer.disconnect(); gsap.ticker.remove(tick); audio.context?.close(); toastTween?.kill(); };
  });
  boot();
}
