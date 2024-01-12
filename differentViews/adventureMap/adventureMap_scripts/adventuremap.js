function changePlanetImage(planetId, activatedPlanetId) {
    const planet = document.getElementById(planetId);
    const activatedPlanet = document.getElementById(activatedPlanetId);

    planet.style.display = 'none';
    activatedPlanet.style.display = 'block';
}

function activatePlanetsBasedOnXP(userXP) {

    // Current planet XP requirements:
    //      Planet Cosmo - 10 points
    //      Planet Wanda - 20 points
    //      Planet Cryo - 30 points
    //      Planet Aurora - 40 points
    //      Planet Micky - 50 points
    //      Planet Pluto - 60 points
    //      Planet Earth - 70 points

    const xpPerPlanet = 10; // XP required to activate each subsequent planet

    for (let i = 1; i <= 7; i++) {
        let planetId = 'planet' + i;
        let activatedPlanetId = 'activatedPlanet' + i;

        // Check if userXP is enough to activate the planet
        if (userXP >= i * xpPerPlanet) {
            changePlanetImage(planetId, activatedPlanetId);
        }
    }
}

function fetchAndDisplayXP() {
    fetch('/getUserXP')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.userXP) {
                document.getElementById('xpValueToDisplay').textContent = `${data.userXP}`;
                activatePlanetsBasedOnXP(data.userXP); // Call to activate planets
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// Call the function on page load to show user XP and activate planets
fetchAndDisplayXP();
