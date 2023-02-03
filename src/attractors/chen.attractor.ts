import ParticleSystem from "./../lib/system/system";

class ChenAttractor extends ParticleSystem {
	numberParticles = 1000000;
	speed = 0.5;
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

// export const ChenAttractorConfig: SystemAndConfig = {
// 	system: new ChenAttractor(),
// 	name: "Chen  Attractor",
// 	config: {
// 		particles: 1000000,
// 		zoom: 250,
// 		speed: 1,
// 		sizeParticle: 0.2,
// 		autoRotate: true,
// 		description: "",
// 	},
// };

export default ChenAttractor;
