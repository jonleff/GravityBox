// Update the physics of each particle
function move() {

	// Move non-fixed stars

	for (const star of stars) {

		if (star.params.fixed === true) {
			continue;
		}

		ax = 0;
		ay = 0;
		az = 0;

		for (const starOther of stars) {

			if (starOther.params.id === star.params.id) {
				continue;
			}

			dx = starOther.mesh.position.x - star.mesh.position.x;
			dy = starOther.mesh.position.y - star.mesh.position.y;
			dz = starOther.mesh.position.z - star.mesh.position.z;
			
			r = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));

			force = (G * star.params.mass * starOther.params.mass) / (r * r);

			ax += (force * dx) / r;
			ay += (force * dy) / r;
			az += (force * dz) / r;


		}

		star.params.vx += ax;
		star.params.vy += ay;
		star.params.vz += az;


		star.mesh.position.x += star.params.vx;
		star.mesh.position.y += star.params.vy;
		star.mesh.position.z += star.params.vz;

	};


	// Execute SHM for star particles

	for (const star of stars) {
		
		for (const particle of star.particles) {

			ax = -particle.kx * (particle.xLocal - particle.x0);
			ay = -particle.ky * (particle.yLocal - particle.y0);
			az = -particle.kz * (particle.zLocal - particle.z0);

			particle.vx += ax;
			particle.vy += ay;
			particle.vz += az;

			particle.xLocal += particle.vx;
			particle.yLocal += particle.vy;
			particle.zLocal += particle.vz;

			matrix.setPosition(particle.xLocal, particle.yLocal, particle.zLocal);
			star.mesh.setMatrixAt(particle.index, matrix);

		}

		// Needed to update InstancedMesh object
		star.mesh.instanceMatrix.needsUpdate = true;
		star.mesh.instanceColor.needsUpdate = true;

	}





	// List to keep track of velocities for each particle
	vs = [];

	// Iterate through every particle
	for (const particle of particles) {

		// Skip the physics logic for any deactivated particles
		if (particle.active == false) {
			continue;
		}

		// Reset accelerations
		ax = 0;
		ay = 0;
		az = 0;

		for (const star of stars) {

			dx = star.mesh.position.x - particle.x;
			dy = star.mesh.position.y - particle.y;
			dz = star.mesh.position.z - particle.z;
		
			r = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));

			// Sucked into black hole
			if (r < star.params.radius) {
				particle.active = false;
				matrix.setPosition(0, 0, 0);
				mesh.setMatrixAt(particle.index, matrix);
				break;
			}

			force = (G * star.params.mass) / (r * r);

			ax += (force * dx) / r;
			ay += (force * dy) / r;
			az += (force * dz) / r;


		}

		particle.vx += ax;
		particle.vy += ay;
		particle.vz += az;

		particle.x += particle.vx;
		particle.y += particle.vy;
		particle.z += particle.vz;

		particle.v = Math.sqrt((particle.vx * particle.vx) + (particle.vy * particle.vy) + (particle.vz * particle.vz));

		vs.push(particle.v);
		
	}


	vMean = 0;

	for (const v of vs) {
		vMean += v;
	}

	vMean /= vs.length;


	// Iterate through every particle
	for (const particle of particles) {

		if (particle.active == false) {
			continue
		}

		// Update particle position and color
		matrix.setPosition(particle.x, particle.y, particle.z);

		// Use sigmoid function to compute new color based on particle velocity and average velocity of the system
		colorIndex = Math.floor(511 / (1 + Math.exp(-10 * (particle.v - vMean))));
		
		mesh.setMatrixAt(particle.index, matrix);
		mesh.setColorAt(particle.index, color.setHex( colors[colorIndex] ));

	}

	// Needed to update InstancedMesh object
	mesh.instanceMatrix.needsUpdate = true;
	mesh.instanceColor.needsUpdate = true;
	
}