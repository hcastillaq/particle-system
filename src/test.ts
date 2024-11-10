import { LorenzAttractor } from './attractors/lorenz.attractor';
import { GArt, GArtConfig } from './lib';

const system = new LorenzAttractor();

const config: GArtConfig = {
  system,
  container: document.getElementById('app') as HTMLElement,
  zoom: 100,
  material: {
    color: 'cyan',
    sizeParticle: 0.01,
    opacity: 0.1,
  },
  orbitConfig: {
    autoRotate: true,
  },
  stats: true,
};

const gArt = new GArt(config);
const callbacks = gArt.load();
callbacks.start();
