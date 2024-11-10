import { BufferGeometry } from 'three';
import { GArtParticle } from './interfaces';
export declare abstract class GArtSystem<T extends GArtParticle> {
    protected particles: T[];
    protected numberParticles: number;
    protected speed: number;
    protected geometry: BufferGeometry;
    protected abstract make(): T;
    abstract update(): void;
    setParticlesNumber(number: number): void;
    getParticlesNumber(): number;
    getParticles(): T[];
    setGeometry(geometry: BufferGeometry): void;
    setSpeed(speed: number): void;
    changeSpeed(speed: number): void;
    makeParticles(): void;
    protected setParticlesInGeometry(vertices: Array<number>): void;
    protected random(min: number, max: number): number;
    dispose(): void;
    apply(index: number, x: number, y: number, z: number): void;
    private updateParticles;
    protected validatePositiveNumber(value: number): boolean;
    changeNumberParticles(size: number): void;
}
