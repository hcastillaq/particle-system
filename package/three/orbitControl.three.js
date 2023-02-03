import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
const defaultConfig = {
    enableDamping: true,
    dampingFactor: 0.25,
    enableZoom: true,
    autoRotate: true,
    autoRotateSpeed: 0.5,
};
export const getOrbitControl = (camera, element, config) => {
    config = Object.assign(Object.assign({}, defaultConfig), config);
    const controls = new OrbitControls(camera, element);
    controls.enableDamping = config.enableDamping;
    controls.dampingFactor = config.dampingFactor;
    controls.enableZoom = config.enableZoom;
    controls.autoRotate = config.autoRotate;
    controls.autoRotateSpeed = config.autoRotateSpeed || 0.3;
    return controls;
};
//# sourceMappingURL=orbitControl.three.js.map