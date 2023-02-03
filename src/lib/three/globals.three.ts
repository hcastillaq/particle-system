import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
export const SCENE = new Scene();
export const WIDTH = window.innerWidth;
export const HEIGHT = window.innerHeight;
export const CAMERA = new PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
//renderer
export const RENDERER = new WebGLRenderer({
	antialias: true,
	powerPreference: "high-performance",
});
RENDERER.setPixelRatio(window.devicePixelRatio);
RENDERER.setSize(WIDTH, HEIGHT);
