import { BufferGeometry, Float32BufferAttribute, Scene } from "three";

export type Particles = { [key: string]: number };

export abstract class ParticleSystem {
	protected particles: Array<Particles> = [];
	protected numberParticles: number = 0;
	protected speed: number = 1;
	protected geometry: BufferGeometry = new BufferGeometry();
	protected scene: Scene = new Scene();
	public abstract update(): void;
	protected abstract make(): Particles;

	public setParticlesNumber(number: number): void {
		this.numberParticles = number;
	}
	public getParticlesNumber() {
		return this.particles.length;
	}

	public setGeometry(geometry: BufferGeometry): void {
		this.geometry = geometry;
		this.makeVertices();
	}

	public setSpeed(speed: number): void {
		this.speed = speed;
	}

	public changeSpeed(speed: number) {
		this.speed = speed;
	}

	private makeVertices(): void {
		const vertices: Array<any> = [];
		for (let i = 0; i < this.numberParticles; i++) {
			const particle = this.make();
			this.particles.push(particle);
			vertices.push(particle.x, particle.y, particle.z);
		}
		this.updateGeometricParticles(vertices);
	}

	private updateGeometricParticles(vertices: Array<number>) {
		this.geometry.setAttribute(
			"position",
			new Float32BufferAttribute(vertices, 3),
		);
	}

	protected random(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	public dispose() {
		this.geometry.dispose();
		this.geometry.deleteAttribute("position");
		this.particles = [];
		this.numberParticles = 0;
		this.speed = 1;
	}

	public setScene(scene: Scene) {
		this.scene = scene;
	}

	protected apply(index: number, x: number, y: number, z: number) {
		const position = this.geometry.attributes.position as any;
		position.setXYZ(index, x, y, z);
	}

	private updateParticles() {
		const vertices = [];
		for (let i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];
			vertices.push(particle.x, particle.y, particle.z);
		}
		this.updateGeometricParticles(vertices);
	}

	protected validatePositiveNumber(value: number): boolean {
		return value >= 0 ? true : false;
	}

	public changeNumberParticles(size: number): void {
		size = Number(size.toPrecision(1));
		if (this.validatePositiveNumber(size)) {
			if (size < this.numberParticles) {
				this.particles = this.particles.splice(this.numberParticles - size);
				this.setParticlesNumber(this.particles.length);
				this.updateParticles();
			}
			if (size > this.numberParticles) {
				for (let i = 0; i < size; i++) {
					this.particles.push(this.make());
				}
				this.setParticlesNumber(this.numberParticles + size);
				this.updateParticles();
			}
		}
	}
}
