

// Funktion zum Ändern des Planetenbildes
function changePlanetImage(planetId, activatedPlanetId) {
    var planet = document.getElementById(planetId);
    var activatedPlanet = document.getElementById(activatedPlanetId);

    planet.style.display = 'none';
    activatedPlanet.style.display = 'block';
}

function addListenersForPlanets() {
    const numberOfPlanets = 6;


    for(let i = 1; i <= numberOfPlanets; i++) {
        let planetId = 'planet' + i;
        let activatedPlanetId = 'activatedPlanet' + i;

        let planet = document.getElementById(planetId);
        if (planet) {
            planet.addEventListener('click', function() {
                changePlanetImage(planetId, activatedPlanetId);
            });
        }
    }
}
addListenersForPlanets();