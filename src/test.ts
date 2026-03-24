import LorenzAttractor from "./attractors/lorenz.attractor";
import { createGArtCPU, GArtCPUConfig } from "./lib";

const system = new LorenzAttractor();

const config: GArtCPUConfig = {
	system,
	container: document.getElementById("app") as HTMLElement,
	zoom: 200,
	material: {
		color: "#00FFFF",
		sizeParticle: 0.01,
		opacity: 0.01,
	},
	orbitConfig: {
		autoRotate: true,
	},
	stats: true,
};

const gArt = createGArtCPU(config);
gArt.start();
