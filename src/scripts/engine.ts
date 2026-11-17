import { gsap } from 'gsap';

/** One page lifecycle and one GSAP clock for this bounded static prototype. */
type PageEffect = () => void | (() => void);
const effects = new Set<PageEffect>();
let context: gsap.Context | undefined;
let cleanups: (() => void)[] = [];
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ease = { out: 'expo.out', soft: 'power3.out', inOut: 'expo.inOut' };
export function onPage(effect: PageEffect) { effects.add(effect); }
export function boot() {
  context?.revert();
  cleanups.forEach(fn => fn());
  cleanups = [];
  context = gsap.context(() => effects.forEach(effect => {
    const cleanup = effect();
    if (cleanup) cleanups.push(cleanup);
  }));
}
