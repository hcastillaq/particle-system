import { Scene } from "three";
import { GArtOrbitControlConfig } from "../interfaces";

export const DEFAULT_ORBIT_CONFIG: GArtOrbitControlConfig = {
	enableDamping: true,
	dampingFactor: 0.25,
	enableZoom: true,
	autoRotate: true,
	autoRotateSpeed: 0.1,
};

export const orbitRotate = (
	orbitConfig: GArtOrbitControlConfig,
	userInteracting: boolean,
	scene: Scene
) => {
	if (orbitConfig.autoRotate && !userInteracting) {
		const autoSpeed =
			orbitConfig.autoRotateSpeed || DEFAULT_ORBIT_CONFIG.autoRotateSpeed!;

		const speed = autoSpeed * Math.PI * 0.001;
		scene.rotateX(speed * 0.5);
		scene.rotateY(speed);
		scene.rotateZ(speed * 0.3);
	}
};
