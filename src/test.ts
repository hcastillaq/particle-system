import {
	ParticleSystemAnimation,
	ParticleSystemAnimationConfig,
} from "./lib/three/config.three";

import { LorenzAttractor } from "./attractors/lorenz.attractor";

const chen = new LorenzAttractor();

const config: ParticleSystemAnimationConfig = {
	system: chen,
	container: document.getElementById("app") as HTMLElement,
	zoom: 100,
	material: {
		color: "red",
		sizeParticle: 0.01,
		opacity: 0.1,
	},
	orbitConfig: {
		autoRotate: true,
	},
	stats: true,
};

const animation = ParticleSystemAnimation(config);
animation.start();
