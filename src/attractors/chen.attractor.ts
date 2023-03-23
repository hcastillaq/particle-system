import { ParticleSystem } from "../lib/system";

export class ChenAttractor extends ParticleSystem {
	numberParticles = 4000000;
	speed = 2;

	make() {
		return {
			x: 5,
			y: 10,
			z: 10,
			dt: this.random(0.001, 0.01),
			a: 5,
			b: -10,
			c: -38,
		};
	}

	update() {
		for (let i = 0; i < this.numberParticles; i++) {
			const particle = this.particles[i];

			const dx = particle.a * particle.x - particle.y * particle.z;
			const dy = particle.b * particle.y + particle.x * particle.z;
			const dz = particle.c * particle.z + (particle.x * particle.y) / 3;

			particle.x += dx * particle.dt * this.speed;
			particle.y += dy * particle.dt * this.speed;
			particle.z += dz * particle.dt * this.speed;
			this.apply(i, particle.x, particle.y, particle.z);
		}
	}
}

export default ChenAttractor;
