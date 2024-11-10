example project using this library [https://g-art.vercel.app/](https://g-art.vercel.app/)

<img  src="https://raw.githubusercontent.com/hcastillaq/particle-system/master/public/particles.png" alt="Dadras Attractor"  width="800" >



```
npm install particle-system
yarn install particle-system

```
 
```
import import { GArt, GArtConfig } from "particle-system";


const container =  document.getElementById("app")

const system = new LorenzAttractor();

const config: GArtConfig = {
  system,
  container: document.getElementById('app') as HTMLElement,
  zoom: 100,
  material: {
    color: 'cyan',
    sizeParticle: 0.01,
    opacity: 0.1,
  },
  orbitConfig: {
    autoRotate: true,
  },
  stats: true,
};

const gArt = new GArt(config);
const callbacks = gArt.load();
callbacks.start();

```

## Create system (example lorenz attractor)
 [https://en.wikipedia.org/wiki/Lorenz_system](https://en.wikipedia.org/wiki/Lorenz_system).

```
import { GArtParticle, GArtSystem } from "particle-system";

interface LorenzParticle extends GArtParticle {
  a: number;
  b: number;
  c: number;
  dt: number;
}

export class LorenzAttractor extends GArtSystem<LorenzParticle> {
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


```


### How create ParticleSystem

for create a ParticleSystem we need two necessary functions, make and update.

```
class ExampleSystem extends GArtSystem {

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
			
			// function to apply changes
			this.apply(index, particle.x,particle.y,particle.z);

		}
	}
}


```

## GArt

Params
```
interface GArtConfig {
  system: GArtSystem<GArtParticle>;
  container: HTMLElement;
  material: {
    color: string;
    opacity?: number;
    sizeParticle?: number;
  };
  zoom?: number;
  stats?: boolean;
  orbitConfig?: GArtOrbitControlConfig;
}



interface GArtOrbitControlConfig {
  enableDamping?: boolean;
  dampingFactor?: number;
  enableZoom?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}
```

Callbacks

```

interface GArtCallbacks {
  start: () => void;
  stop: () => void;
  changeColor: (color: number) => void;
  changeOpacity: (opacity: number) => void;
  takePhoto: () => void;
}
```
