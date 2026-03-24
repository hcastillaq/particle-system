import { GArtSystemGPU } from "../lib";

export class LorenzAttractorGPU extends GArtSystemGPU {
	protected numberParticles = 10_000_000;

	protected positionShader = /* glsl */ `
		void main() {
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec4 pos = texture2D(texturePosition, uv);

			float a  = 10.0;
			float b  = 39.99;
			float c  = 2.6667;
			float dt = pos.w;

			float dx = a * (pos.y - pos.x) * dt;
			float dy = (pos.x * (b - pos.z) - pos.y) * dt;
			float dz = (pos.x * pos.y - c * pos.z) * dt;

			gl_FragColor = vec4(pos.x + dx, pos.y + dy, pos.z + dz, pos.w);
		}
	`;

	protected getInitialData(): Float32Array {
		const data = new Float32Array(this.numberParticles * 4);
		for (let i = 0; i < this.numberParticles; i++) {
			data[i * 4] = 1;
			data[i * 4 + 1] = 1;
			data[i * 4 + 2] = 1;
			data[i * 4 + 3] = Math.random() * 0.005 + 0.001; // dt ∈ [0.001, 0.005]
		}
		return data;
	}
}

export default LorenzAttractorGPU;
