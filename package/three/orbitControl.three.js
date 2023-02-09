import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
const defaultConfig = {
    enableDamping: true,
    dampingFactor: 0.25,
    enableZoom: true,
    autoRotate: true,
    autoRotateSpeed: 0.5,
};
export const getOrbitControl = (camera, element, config) => {
    config = { ...defaultConfig, ...config };
    const controls = new OrbitControls(camera, element);
    controls.enableDamping = config.enableDamping ? true : false;
    controls.dampingFactor = config.dampingFactor ? config.dampingFactor : 0.25;
    controls.enableZoom = config.enableZoom ? true : false;
    controls.autoRotate = config.autoRotate ? true : false;
    controls.autoRotateSpeed = config.autoRotateSpeed
        ? config.autoRotateSpeed
        : 0.3;
    return controls;
};
