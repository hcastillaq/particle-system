import { GArtSystem } from "../GArtSystem";

export abstract class GArtSystemCPU extends GArtSystem {
	private particles: Float32Array;

	constructor(particleCount: number) {
		super(particleCount);
		this.initializeParticles();
	}

	public abstract update(dt: number): void;
	public abstract createParticle(): number[];

	private initializeParticles() {
		this.particles = new Float32Array(
			this.getParticleCount() * this.getParticleAttributesCount()
		);

		for (let i = 0; i < this.getParticleCount(); i++) {
			const particle = this.createParticle();
			const offset = i * this.getParticleAttributesCount();
			for (let j = 0; j < particle.length; j++) {
				this.particles[offset + j] = particle[j];
			}
		}
	}

	public getParticles(): Float32Array {
		return this.particles;
	}

	public getParticleAttributesCount(): number {
		return this.createParticle().length;
	}
}
