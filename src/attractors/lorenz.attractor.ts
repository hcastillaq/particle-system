import { GArtSystemCPU } from "../lib";

export class LorenzAttractor extends GArtSystemCPU {
	private A = 10.0;
	private B = 39.99;
	private C = 8 / 3;

	public createParticle(): number[] {
		return [1, 1, 1, this.random(0.001, 0.005)];
	}

	update(dt: number) {
		const particles = this.getParticles();
		const particleCount = this.getParticleCount();
		const attributes = 4;

		for (let i = 0; i < particleCount; i++) {
			const offset = i * attributes;
			const x = particles[offset];
			const y = particles[offset + 1];
			const z = particles[offset + 2];
			const step = particles[offset + 3] * dt;

			const dx = this.A * (y - x);
			const dy = x * (this.B - z) - y;
			const dz = x * y - this.C * z;

			particles[offset] = x + dx * step;
			particles[offset + 1] = y + dy * step;
			particles[offset + 2] = z + dz * step;
		}
	}
}

export default LorenzAttractor;
