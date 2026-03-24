import { BufferGeometry, Float32BufferAttribute } from "three";
import { GArtParticle } from "../interfaces";

export abstract class GArtSystemCPU<T extends GArtParticle> {
	// ── Abstract contract (subclasses must implement) ────────────────────────
	protected abstract make(): T;
	public abstract update(): void;

	// ── State accessible to subclasses ───────────────────────────────────────
	protected particles: T[] = [];
	protected numberParticles: number = 0;
	protected speed: number = 1;

	// ── Private state ────────────────────────────────────────────────────────
	private geometry: BufferGeometry = new BufferGeometry();
	private maxParticles: number = 0;

	// ── Public API ───────────────────────────────────────────────────────────
	public setGeometry(geometry: BufferGeometry): void {
		this.geometry = geometry;
		this.makeParticles();
		this.maxParticles = this.numberParticles;
	}

	public setSpeed(speed: number): void {
		this.speed = speed;
	}

	public getParticlesNumber(): number {
		return this.particles.length;
	}

	public getParticles(): T[] {
		return this.particles;
	}

	public changeNumberParticles(size: number): void {
		size = Math.floor(size);
		if (size < 0 || size === this.numberParticles) return;

		const isAddingParticles = size > this.numberParticles;

		if (!isAddingParticles) {
			this.particles = this.particles.slice(0, size);
			this.setParticlesNumber(size);
			this.geometry.setDrawRange(0, size);
			return;
		}

		// Adding particles
		const particlesToAdd = size - this.numberParticles;
		const oldParticlesNumber = this.numberParticles;

		for (let i = 0; i < particlesToAdd; i++) {
			this.particles.push(this.make());
		}
		this.setParticlesNumber(size);

		// if original buffer size can accommodate new particles, just update positions and draw range
		const isBufferSizeSufficient = size <= this.maxParticles;

		if (isBufferSizeSufficient) {
			const position = this.geometry.attributes
				.position as Float32BufferAttribute;
			for (let i = oldParticlesNumber; i < size; i++) {
				const p = this.particles[i];
				position.setXYZ(i, p.x, p.y, p.z);
			}
			this.geometry.setDrawRange(0, size);
			return;
		}

		this.rebuildBuffer();
		this.maxParticles = size;
	}

	public dispose(): void {
		this.geometry.dispose();
		this.geometry.deleteAttribute("position");
		this.particles = [];
		this.numberParticles = 0;
		this.maxParticles = 0;
		this.speed = 1;
	}

	// ── Protected utilities (for subclasses) ─────────────────────────────────
	protected apply(index: number, x: number, y: number, z: number): void {
		const position = this.geometry.attributes
			.position as Float32BufferAttribute;
		position.setXYZ(index, x, y, z);
	}

	protected random(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	// ── Private implementation ───────────────────────────────────────────────
	private makeParticles(): void {
		this.particles = [];
		const vertices: number[] = [];
		for (let i = 0; i < this.numberParticles; i++) {
			const particle = this.make();
			this.particles.push(particle);
			vertices.push(particle.x, particle.y, particle.z);
		}
		this.setParticlesInGeometry(vertices);
	}

	private rebuildBuffer(): void {
		const vertices: number[] = [];
		for (let i = 0; i < this.particles.length; i++) {
			const p = this.particles[i];
			vertices.push(p.x, p.y, p.z);
		}
		this.setParticlesInGeometry(vertices);
	}

	private setParticlesInGeometry(vertices: number[]): void {
		this.geometry.setAttribute(
			"position",
			new Float32BufferAttribute(vertices, 3)
		);
	}

	private setParticlesNumber(number: number): void {
		this.numberParticles = number;
	}
}
