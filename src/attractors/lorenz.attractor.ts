import { ParticleSystem } from "../lib/system";

export class LorenzAttractor extends ParticleSystem {
	numberParticles = 4000000;
	speed = 1;

	make() {
		return {
			x: 1,
			y: 1,
			z: 1,
			a: 10,
			b: 39.99,
			c: 8 / 3,
			dt: this.random(0.001, 0.005),
		};
	}

	update() {
		for (let i = 0; i < this.numberParticles; i++) {
			const particle = this.particles[i];

			const dx = particle.a * (particle.y - particle.x) * particle.dt;

			const dy =
				(particle.x * (particle.b - particle.z) - particle.y) * particle.dt;

			const dz =
				(particle.x * particle.y - particle.c * particle.z) * particle.dt;

			particle.x += dx * this.speed;
			particle.y += dy * this.speed;
			particle.z += dz * this.speed;
			this.apply(i, particle.x, particle.y, particle.z);
		}
	}
}

export default LorenzAttractor;
