function changePlanetImage(planetId, activatedPlanetId) {
    const planet = document.getElementById(planetId);
    const activatedPlanet = document.getElementById(activatedPlanetId);

    planet.style.display = 'none';
    activatedPlanet.style.display = 'block';
    // Adding click event listener to the activated planet
    activatedPlanet.onclick = function() { planetClickHandler(parseInt(planetId.replace('planet', ''))); };
}

function activatePlanetsBasedOnXP(userXP) {
    const xpPerPlanet = 10; // XP required to activate each subsequent planet

    for (let i = 1; i <= 7; i++) {
        let planetId = 'planet' + i;
        let activatedPlanetId = 'activatedPlanet' + i;

        if (userXP >= i * xpPerPlanet) {
            changePlanetImage(planetId, activatedPlanetId);
        }
    }
}

//click event
function planetClickHandler(planetNumber) {
    let userXP = parseInt(document.getElementById('xpValueToDisplay').textContent);
    const xpRequired = planetNumber * 10;

    if (userXP >= xpRequired) {
        alert(`Planet ${planetNumber} is clicked`);
    } else {
        alert(`You need ${xpRequired - userXP} more XP to unlock Planet ${planetNumber}`);
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
                activatePlanetsBasedOnXP(data.userXP);
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

fetchAndDisplayXP();

document.getElementById('backToDashboard').addEventListener('click', function() {
    window.location.href = '/dashboard';
});
