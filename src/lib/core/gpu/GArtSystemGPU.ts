/**
 * Abstract base class for GPU-accelerated particle systems.
 *
 * Physics run entirely on the GPU via a GLSL fragment shader
 * using `GPUComputationRenderer` (ping-pong render targets).
 *
 * @example
 * ```ts
 * class LorenzGPU extends GArtSystemGPU {
 *   protected numberParticles = 1_000_000;
 *
 *   protected positionShader = `
 *     void main() {
 *       vec2 uv = gl_FragCoord.xy / resolution.xy;
 *       vec4 pos = texture2D(texturePosition, uv);
 *       float a = 10.0, b = 28.0, c = 2.6667, dt = 0.005;
 *       float dx = a * (pos.y - pos.x) * dt;
 *       float dy = (pos.x * (b - pos.z) - pos.y) * dt;
 *       float dz = (pos.x * pos.y - c * pos.z) * dt;
 *       gl_FragColor = vec4(pos.x + dx, pos.y + dy, pos.z + dz, 1.0);
 *     }
 *   `;
 *
 *   protected getInitialData(): Float32Array {
 *     const data = new Float32Array(this.numberParticles * 4);
 *     for (let i = 0; i < this.numberParticles; i++) {
 *       data[i * 4]     = (Math.random() - 0.5) * 0.1;
 *       data[i * 4 + 1] = (Math.random() - 0.5) * 0.1;
 *       data[i * 4 + 2] = (Math.random() - 0.5) * 0.1;
 *       data[i * 4 + 3] = 1.0;
 *     }
 *     return data;
 *   }
 * }
 * ```
 */
export abstract class GArtSystemGPU {
	// ── Abstract contract ────────────────────────────────────────────────────

	/** Total number of particles to simulate. */
	protected abstract numberParticles: number;

	/**
	 * GLSL fragment shader that updates particle positions each frame.
	 *
	 * Built-in uniforms available:
	 * - `texturePosition` — `sampler2D` with current positions (xyz = rgb, w unused)
	 * - `resolution` — `vec2` with texture dimensions
	 *
	 * Write the new position to `gl_FragColor.xyz`.
	 */
	protected abstract positionShader: string;

	/**
	 * Returns the initial particle positions as RGBA Float32 data.
	 * Layout: `[x0, y0, z0, 1, x1, y1, z1, 1, ...]` — 4 floats per particle.
	 * Length must be exactly `numberParticles * 4`.
	 */
	protected abstract getInitialData(): Float32Array;

	// ── Public API (used internally by createGArtGPU) ────────────────────────

	getNumberParticles(): number {
		return this.numberParticles;
	}

	getPositionShader(): string {
		return this.positionShader;
	}

	/**
	 * Computes the smallest square-ish texture that fits all particles.
	 * width ≈ height ≈ √N.
	 */
	getTextureSize(): { width: number; height: number } {
		const width = Math.ceil(Math.sqrt(this.numberParticles));
		const height = Math.ceil(this.numberParticles / width);
		return { width, height };
	}

	/**
	 * Returns initial data padded to fill the full `width × height` texture.
	 * Slots beyond `numberParticles` are zeroed out.
	 */
	getInitialTextureData(): Float32Array {
		const { width, height } = this.getTextureSize();
		const textureSize = width * height * 4;
		const initial = this.getInitialData();
		if (initial.length === textureSize) return initial;
		const data = new Float32Array(textureSize);
		data.set(initial.subarray(0, Math.min(initial.length, textureSize)));
		return data;
	}
}
