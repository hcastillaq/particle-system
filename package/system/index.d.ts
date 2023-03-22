import { BufferGeometry, Scene } from "three";
export type Particles = {
    [key: string]: number;
};
export declare abstract class ParticleSystem {
    protected particles: Array<Particles>;
    protected numberParticles: number;
    protected speed: number;
    protected geometry: BufferGeometry;
    protected scene: Scene;
    abstract update(): void;
    protected abstract make(): Particles;
    setParticlesNumber(number: number): void;
    getParticlesNumber(): number;
    setGeometry(geometry: BufferGeometry): void;
    setSpeed(speed: number): void;
    changeSpeed(speed: number): void;
    private makeVertices;
    protected updateGeometricParticles(vertices: Array<number>): void;
    protected random(min: number, max: number): number;
    dispose(): void;
    setScene(scene: Scene): void;
    protected apply(index: number, x: number, y: number, z: number): void;
    private updateParticles;
    protected validatePositiveNumber(value: number): boolean;
    changeNumberParticles(size: number): void;
}
