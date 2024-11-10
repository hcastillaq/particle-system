import { GArtSystem } from './gart.system';

export interface GArtConfig {
  system: GArtSystem<GArtParticle>;
  container: HTMLElement;
  material: {
    color: string;
    opacity?: number;
    sizeParticle?: number;
  };
  zoom?: number;
  stats?: boolean;
  orbitConfig?: GArtOrbitControlConfig;
}

export interface GArtCallbacks {
  start: () => void;
  stop: () => void;
  changeColor: (color: number) => void;
  changeOpacity: (opacity: number) => void;
  takePhoto: () => void;
}

export interface GArtOrbitControlConfig {
  enableDamping?: boolean;
  dampingFactor?: number;
  enableZoom?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export interface GArtParticle {
  x: number;
  y: number;
  z: number;
  [key: string]: unknown;
}
