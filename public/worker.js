onmessage = function (e) {
	const { size, particles, speed, apply } = e.data;
	const vertices = [];
	for (let i = 0; i < size; i++) {
		const particle = particles[i];

		const dx = particle.a * particle.x - particle.y * particle.z;
		const dy = particle.b * particle.y + particle.x * particle.z;
		const dz = particle.c * particle.z + (particle.x * particle.y) / 3;

		particle.x += dx * particle.dt * speed;
		particle.y += dy * particle.dt * speed;
		particle.z += dz * particle.dt * speed;

		vertices.push(particle.x, particle.y, particle.z);
	}
	this.postMessage({ vertices, particles });
};
