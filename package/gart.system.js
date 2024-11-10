import { BufferGeometry, Float32BufferAttribute } from 'three';
export class GArtSystem {
    particles = [];
    numberParticles = 0;
    speed = 1;
    geometry = new BufferGeometry();
    setParticlesNumber(number) {
        this.numberParticles = number;
    }
    getParticlesNumber() {
        return this.particles.length;
    }
    getParticles() {
        return this.particles;
    }
    setGeometry(geometry) {
        this.geometry = geometry;
        this.makeParticles();
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    changeSpeed(speed) {
        this.speed = speed;
    }
    makeParticles() {
        const vertices = [];
        for (let i = 0; i < this.numberParticles; i++) {
            const particle = this.make();
            this.particles.push(particle);
            vertices.push(particle.x, particle.y, particle.z);
        }
        this.setParticlesInGeometry(vertices);
    }
    setParticlesInGeometry(vertices) {
        this.geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    }
    random(min, max) {
        return Math.random() * (max - min) + min;
    }
    dispose() {
        this.geometry.dispose();
        this.geometry.deleteAttribute('position');
        this.particles = [];
        this.numberParticles = 0;
        this.speed = 1;
    }
    apply(index, x, y, z) {
        const position = this.geometry.attributes.position;
        position.setXYZ(index, x, y, z);
    }
    updateParticles() {
        const vertices = [];
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            vertices.push(particle.x, particle.y, particle.z);
        }
        this.setParticlesInGeometry(vertices);
    }
    validatePositiveNumber(value) {
        return value >= 0 ? true : false;
    }
    changeNumberParticles(size) {
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
