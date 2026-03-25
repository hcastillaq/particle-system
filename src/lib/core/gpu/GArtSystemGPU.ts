import { GArtSystem } from "../GArtSystem";

export abstract class GArtSystemGPU extends GArtSystem {
	abstract texturePosition: string;
	protected abstract getInitialData(): Float32Array;

	readonly vertexShader = /* glsl */ `
		uniform sampler2D texturePosition;
		uniform float uSize;

		void main() {
			vec4 pos = texture2D(texturePosition, position.xy);
			vec4 mvPos = modelViewMatrix * vec4(pos.xyz, 1.0);
			gl_PointSize = uSize * (300.0 / -mvPos.z);
			gl_Position = projectionMatrix * mvPos;
		}
	`;

	getTextureSize(): { width: number; height: number } {
		const particleCount = this.getParticleCount();
		const width = Math.ceil(Math.sqrt(particleCount));
		const height = Math.ceil(particleCount / width);
		return { width, height };
	}

	getInitialTextureData(): Float32Array {
		const { width, height } = this.getTextureSize();
		const textureSize = width * height * 4;
		const initial = this.getInitialData();
		if (initial.length === textureSize) return initial;
		const data = new Float32Array(textureSize);
		data.set(initial.subarray(0, Math.min(initial.length, textureSize)));
		return data;
	}
}
