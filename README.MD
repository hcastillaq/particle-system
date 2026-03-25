# particle-system

A high-performance particle system library built on top of [Three.js](https://threejs.org/), supporting both **CPU** and **GPU** (GPGPU via `GPUComputationRenderer`) rendering modes.

Live demo: [https://g-art.vercel.app/](https://g-art.vercel.app/)

<img src="https://raw.githubusercontent.com/hcastillaq/particle-system/master/public/particles.png" alt="Lorenz attractor" width="1280">

---

## Installation

```bash
npm install particle-system
# or
yarn add particle-system
```

---

## Quick start

The library does not ship built-in systems — you define your own by extending `GArtSystemCPU` or `GArtSystemGPU`. Here is a complete working example using the [Lorenz attractor](https://en.wikipedia.org/wiki/Lorenz_system) running on the CPU:

```ts
import { createGArt, GArtSystemCPU } from "particle-system";

// 1. Define the system
class LorenzAttractor extends GArtSystemCPU {
  private A = 10.0;
  private B = 39.99;
  private C = 8 / 3;

  createParticle(): number[] {
    // [x, y, z, dt] — dt is a per-particle time step stored as the 4th attribute
    return [1, 1, 1, this.random(0.001, 0.005)];
  }

  update(dt: number): void {
    const particles = this.getParticles();
    const count = this.getParticleCount();
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      const x    = particles[offset];
      const y    = particles[offset + 1];
      const z    = particles[offset + 2];
      const step = particles[offset + 3] * dt; // per-particle dt scaled by speed

      const dx = this.A * (y - x);
      const dy = x * (this.B - z) - y;
      const dz = x * y - this.C * z;

      particles[offset]     = x + dx * step;
      particles[offset + 1] = y + dy * step;
      particles[offset + 2] = z + dz * step;
    }
  }
}

// 2. Create and start
const callbacks = createGArt({
  system: new LorenzAttractor(500_000),
  container: document.getElementById("app") as HTMLElement,
  zoom: 500,
  speed: 1,
  material: {
    color: "#00ffff",
    sizeParticle: 0.05,
    opacity: 0.08,
  },
  orbitConfig: { autoRotate: true },
});

callbacks.start();
```

---

## API

### `createGArt(config: GArtConfig): GArtCallbacks`

Main factory function. Returns a `GArtCallbacks` object to control the animation.

#### `GArtConfig`

```ts
interface GArtConfig {
  system: GArtSystemCPU | GArtSystemGPU; // particle system instance
  container: HTMLElement;                // DOM element to render into
  material: {
    color: ColorHex;                     // e.g. "#00ffff"
    opacity?: number;                    // default 0.5
    sizeParticle?: number;               // default 0.01 (CPU) / 1.0 (GPU)
  };
  zoom?: number;                         // camera Z position, default 500 (CPU) / 100 (GPU)
  speed?: number;                        // simulation speed [0–2], default 1
  stats?: boolean;                       // show FPS stats overlay
  orbitConfig?: GArtOrbitControlConfig;
}

interface GArtOrbitControlConfig {
  enableDamping?: boolean;    // default true
  dampingFactor?: number;     // default 0.25
  enableZoom?: boolean;       // default true
  autoRotate?: boolean;       // default true
  autoRotateSpeed?: number;   // default 0.5
}
```

#### `GArtCallbacks`

```ts
interface GArtCallbacks {
  start(): void;                        // mount canvas and begin animation
  stop(): void;                         // pause animation (canvas stays mounted)
  dispose(): void;                      // stop + release all GPU/DOM resources
  setColor(color: ColorHex): void;      // change particle color at runtime
  setOpacity(opacity: number): void;    // change opacity at runtime
  setSpeed(speed: number): void;        // change speed [0–2] at runtime
  setAutoRotate(value: boolean): void;  // toggle scene auto-rotation
  takePhoto(fileName?: string): void;   // export 4K PNG (3840×2160)
}
```

---

## Creating a CPU particle system

Extend `GArtSystemCPU`. Implement `createParticle()` to define the initial state of each particle and `update(dt)` to advance the simulation every frame.

```ts
import { GArtSystemCPU } from "particle-system";

export class MySystem extends GArtSystemCPU {
  // Return the initial values for one particle as a flat number array.
  // The array length defines how many attributes each particle has.
  // The first 3 values are always x, y, z (rendered position).
  createParticle(): number[] {
    return [
      Math.random() * 10 - 5,  // x
      Math.random() * 10 - 5,  // y
      Math.random() * 10 - 5,  // z
      this.random(0.001, 0.005) // dt — extra attribute
    ];
  }

  // Called every frame with dt = current speed [0–2].
  // Mutate the particles Float32Array in place.
  update(dt: number): void {
    const particles = this.getParticles();
    const count = this.getParticleCount();
    const stride = 4; // must match createParticle().length

    for (let i = 0; i < count; i++) {
      const o = i * stride;
      const step = particles[o + 3] * dt;
      particles[o]     += /* dx */ step;
      particles[o + 1] += /* dy */ step;
      particles[o + 2] += /* dz */ step;
    }
  }
}

// Usage
const system = new MySystem(100_000);
```

**Key rules:**
- `createParticle()` must always return an array of the same length
- Indices `0, 1, 2` are `x, y, z` — they drive what Three.js renders
- Extra attributes (e.g. `dt`, velocity) go at indices 3+
- Mutate the `Float32Array` returned by `getParticles()` in-place — no allocation needed

---

## Creating a GPU particle system

Extend `GArtSystemGPU`. The simulation runs entirely on the GPU via a GLSL fragment shader (`texturePosition`). The CPU only uploads initial data once.

```ts
import { GArtSystemGPU } from "particle-system";

export class MySystemGPU extends GArtSystemGPU {
  // GLSL fragment shader that advances the simulation.
  // Each texel stores one particle: vec4(x, y, z, dt).
  // uSpeed is injected automatically — multiply dt by it for speed control.
  texturePosition = /* glsl */ `
    uniform float uSpeed;

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      vec4 pos = texture2D(texturePosition, uv);

      float dt = pos.w * uSpeed;

      // your simulation here
      float dx = /* ... */ * dt;
      float dy = /* ... */ * dt;
      float dz = /* ... */ * dt;

      gl_FragColor = vec4(pos.x + dx, pos.y + dy, pos.z + dz, pos.w);
    }
  `;

  // Return the initial Float32Array for all particles.
  // Format: [x, y, z, dt,  x, y, z, dt, ...]  (4 floats per particle)
  protected getInitialData(): Float32Array {
    const count = this.getParticleCount();
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      data[i * 4]     = 0; // x
      data[i * 4 + 1] = 0; // y
      data[i * 4 + 2] = 0; // z
      data[i * 4 + 3] = Math.random() * 0.005 + 0.001; // dt
    }
    return data;
  }
}

// Usage
const system = new MySystemGPU(512 * 512); // particle count should be power-of-two friendly
```

**Key rules:**
- `texturePosition` is a GLSL fragment shader string
- Each texel is a `vec4(x, y, z, dt)` — you can use `w` for any per-particle constant
- `uSpeed` is automatically available as a uniform — always multiply `dt` by it
- `getInitialData()` returns a flat `Float32Array` of `particleCount * 4` floats

---

## Lorenz attractor — GPU example

The same attractor running entirely on the GPU. The simulation shader replaces the CPU `update()` loop. Supports millions of particles at 60fps.

```ts
import { createGArt, GArtSystemGPU } from "particle-system";

class LorenzAttractorGPU extends GArtSystemGPU {
  // GLSL fragment shader — runs once per particle per frame on the GPU.
  // uSpeed is injected automatically by the library.
  texturePosition = /* glsl */ `
    uniform float uSpeed;

    void main() {
      vec2 uv    = gl_FragCoord.xy / resolution.xy;
      vec4 pos   = texture2D(texturePosition, uv);

      float a  = 10.0;
      float b  = 39.99;
      float c  = 2.6667;
      float dt = pos.w * uSpeed;

      float dx = a * (pos.y - pos.x) * dt;
      float dy = (pos.x * (b - pos.z) - pos.y) * dt;
      float dz = (pos.x * pos.y - c * pos.z) * dt;

      gl_FragColor = vec4(pos.x + dx, pos.y + dy, pos.z + dz, pos.w);
    }
  `;

  protected getInitialData(): Float32Array {
    const count = this.getParticleCount();
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      data[i * 4]     = 1; // x
      data[i * 4 + 1] = 1; // y
      data[i * 4 + 2] = 1; // z
      data[i * 4 + 3] = Math.random() * 0.005 + 0.001; // dt
    }
    return data;
  }
}

const callbacks = createGArt({
  system: new LorenzAttractorGPU(512 * 512), // ~262k particles
  container: document.getElementById("app") as HTMLElement,
  zoom: 100,
  speed: 1,
  material: { color: "#ff6600", opacity: 0.5, sizeParticle: 2.0 },
});

callbacks.start();
```

---

## Runtime controls

```ts
const callbacks = createGArt({ ... });
callbacks.start();

// Change color
callbacks.setColor("#ff00ff");

// Slow down to half speed (smooth, no stuttering)
callbacks.setSpeed(0.5);

// Freeze simulation
callbacks.setSpeed(0);

// Double speed
callbacks.setSpeed(2);

// Toggle auto-rotation
callbacks.setAutoRotate(false);

// Export 4K PNG
callbacks.takePhoto("my-attractor");

// Pause / resume
callbacks.stop();
callbacks.start();

// Full cleanup (removes canvas, releases GPU memory)
callbacks.dispose();
```

---

## Migration guide: v2 → v3

### Breaking changes

| v2 | v3 |
|----|----|
| `new GArt(config)` + `gArt.load()` | `createGArt(config)` — single factory function |
| `changeColor(color)` | `setColor(color: ColorHex)` |
| `changeOpacity(opacity)` | `setOpacity(opacity)` |
| `changeAutoRotate(value)` | `setAutoRotate(value)` |
| No `dispose()` | `dispose()` — required for proper cleanup |
| `GArtSystem<T>` with object particles | `GArtSystemCPU` with flat `Float32Array` |
| `system.speed` property on class | `speed` in `GArtConfig` + `setSpeed()` callback |
| `window` resize listener | `ResizeObserver` on container — works in any layout |
| GPU: `variables: GArtGPUVariable[]` array | GPU: `texturePosition: string` — single shader string |
| GPU: manual `vertexShader` required | GPU: `vertexShader` is built-in, no override needed |

### New in v3

- **`speed` control** — `setSpeed(value)` accepts `[0–2]`. Implemented as a `dt` multiplier so all speeds render at 60fps without stuttering
- **Container-aware sizing** — renderer matches the container element (not the window), `ResizeObserver` handles dynamic resizing
- **4K photo export** — `takePhoto()` always renders at 3840×2160
- **Circular particles** — CPU uses a radial gradient canvas texture; GPU uses `gl_PointCoord` discard for smooth round particles with glow
- **HiDPI rendering** — pixel ratio capped at 2 (was 1) for sharp rendering on Retina displays
- **`dispose()`** — full cleanup of GPU render targets, geometries, materials, canvas DOM element
- **GPU `uSpeed` uniform** — automatically injected into the GPGPU shader; just use `pos.w * uSpeed` as your `dt`

