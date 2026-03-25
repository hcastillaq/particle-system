export abstract class GArtSystem {
	protected particleCount: number;

	constructor(particleCount: number) {
		this.particleCount = particleCount;
	}

	getParticleCount(): number {
		return this.particleCount;
	}

	protected random(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}
}
