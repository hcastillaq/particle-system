import LorenzAttractor from "./attractors/lorenz.attractor";
import { GArtCallbacks, GArtConfig } from "./lib";
import { createGArt } from "./lib/core/createGArt";

const main = () => {
	const particlesNumber = 5_000_000;

	const system = new LorenzAttractor(particlesNumber);

	const config: GArtConfig = {
		system,
		container: document.getElementById("app") as HTMLElement,
		zoom: 200,
		material: {
			color: "#00FFFF",
			sizeParticle: 0.01,
			opacity: 0.1,
		},
		orbitConfig: {
			autoRotate: true,
		},
		stats: true,
		speed: 1,
	};

	const gArt = createGArt(config);
	gArt.start();

	configureOptions(
		config.speed,
		config.material.opacity,
		config.orbitConfig.autoRotate,
		config.material.color,
		gArt
	);
};

const configureOptions = (
	speed: number,
	opacity: number,
	autoRotate: boolean,
	color: string,
	gArt: GArtCallbacks
) => {
	const speedInput = document.getElementById("speed") as HTMLInputElement;
	const opacityInput = document.getElementById("opacity") as HTMLInputElement;
	const autoRotateInput = document.getElementById(
		"autoRotate"
	) as HTMLInputElement;
	const takePhotoButton = document.getElementById(
		"takePhoto"
	) as HTMLButtonElement;
	const colorInput = document.getElementById("color") as HTMLInputElement;

	colorInput.value = color;
	speedInput.value = speed.toString();
	opacityInput.value = opacity.toString();
	autoRotateInput.checked = autoRotate;

	speedInput.addEventListener("input", (event) => {
		const newSpeed = parseFloat((event.target as HTMLInputElement).value);
		gArt.setSpeed(newSpeed);
	});

	opacityInput.addEventListener("input", (event) => {
		const newOpacity = parseFloat((event.target as HTMLInputElement).value);
		gArt.setOpacity(newOpacity);
	});

	takePhotoButton.addEventListener("click", () => {
		gArt.takePhoto();
	});

	autoRotateInput.addEventListener("change", (event) => {
		const isChecked = (event.target as HTMLInputElement).checked;
		gArt.setAutoRotate(isChecked);
	});

	colorInput.addEventListener("input", (event) => {
		const newColor = (event.target as HTMLInputElement).value;
		gArt.setColor(newColor as `#${string}`);
	});
};

main();
