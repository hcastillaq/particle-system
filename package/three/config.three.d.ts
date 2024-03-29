import { ParticleSystem } from "./../system/index.js";
import { OrbitControlConfig } from "./orbitControl.three.js";
export type ParticleSystemAnimationConfig = {
    system: ParticleSystem;
    container: HTMLElement;
    stats?: boolean;
    material: {
        color: string;
        opacity?: number;
        sizeParticle?: number;
    };
    zoom?: number;
    orbitConfig?: OrbitControlConfig;
};
export type ParticleSystemAnimationCallbacks = {
    start: () => void;
    stop: () => void;
    changeColor: (color: number) => void;
    changeOpacity: (opacity: number) => void;
    takePhoto: () => void;
};
export declare const ParticleSystemAnimation: (config: ParticleSystemAnimationConfig) => ParticleSystemAnimationCallbacks;
