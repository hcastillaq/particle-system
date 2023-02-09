import { PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export type OrbitControlConfig = {
    enableDamping?: boolean;
    dampingFactor?: number;
    enableZoom?: boolean;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
};
export declare const getOrbitControl: (camera: PerspectiveCamera, element: HTMLElement, config: OrbitControlConfig | undefined) => OrbitControls;
