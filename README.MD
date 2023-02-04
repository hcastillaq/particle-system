example project using this library [https://www.gartsimulation.com/](https://www.gartsimulation.com/)

<img  src="https://raw.githubusercontent.com/hcastillaq/particle-system/master/public/particles.png" alt="Dadras Attractor"  width="800" >



```
npm install particle-system
yarn install particle-system

```


```
import {
	ParticleSystemAnimation,
	ParticleSystemAnimationConfig,
} from "particle-system";

const system = new ChenAttractor();

const container =  document.getElementById("app")
const config: ParticleSystemAnimationConfig = {
	system: system,
	container: container,
	stats: true,
	material: {
		color: "#ff9d00",
		opacity: 0.5,
		sizeParticle: 0.5,
	},
	orbitConfig: {
		enableZoom: true,
		autoRotate: true,
	}
};
const animation = ParticleSystemAnimation(config);

animation.start();

```

## Create system (example chen attractor)
 [https://en.wikipedia.org/wiki/Multiscroll_attractor](https://en.wikipedia.org/wiki/Multiscroll_attractor).

```
import { ParticleSystem } from "particle-system";

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

export default ChenAttractor;


```


### How create ParticleSystem

for create a ParticleSystem we need two necessary functions, make and update.

```
class ExampleSystem extends ParticleSystem {

	numberParticles = 10000 // define number of particles
	speed = 0.8 // speed of particles

	// define basic params for the particle and extra information
	make(){
		return {
			x: 0,
			y: 0,
			z: 0
		}
	}


	//function for update all particles
	update(){

		// iterate all particles
		for (let index = 0; index < this.numberParticles; index++) {

			const particle = this.particles[index];
			// ... calculate
			
			// update particle... 
			this.apply(index, particle.x,particle.y,particle.z); // function to apply changes

		}
	}


}


```

## ParticleSystemAnimation

Params
```
type ParticleSystemAnimationConfig = {
	system: ParticleSystem;
	container: HTMLElement;
	stats?: boolean;
	material: {
		color: string;
		opacity?: number;
		sizeParticle: number;
	};
	zoom?: number;
	orbitConfig?: OrbitControlConfig;
};


type OrbitControlConfig = {
	enableDamping?: boolean;
	dampingFactor?: number;
	enableZoom?: boolean;
	autoRotate?: boolean;
	autoRotateSpeed?: number;
};
```
Callbacks


```

type ParticleSystemAnimationCallbacks = {
	start: () => void;
	stop: () => void;
	changeColor: (color: number) => void;
	changeOpacity: (opacity: number) => void;
	takePhoto: () => void;
};
```
