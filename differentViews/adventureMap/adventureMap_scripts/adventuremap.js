function changePlanetImage(planetId, activatedPlanetId) {
    const planet = document.getElementById(planetId);
    const activatedPlanet = document.getElementById(activatedPlanetId);

    planet.style.display = 'none';
    activatedPlanet.style.display = 'block';
}

function changeBackgroundImage(userXP) {
    const body = document.querySelector('body');
    const skinNumber = Math.min(Math.floor(userXP / 10), 6); // Assuming there are 6 skins
    body.style.backgroundImage = `url('adventureMap_styling/skins/Skin${skinNumber}.png')`;
}

function activatePlanetsBasedOnXP(userXP) {
    const xpPerPlanet = 10;

    for (let i = 1; i <= 7; i++) {
        let planetId = 'planet' + i;
        let activatedPlanetId = 'activatedPlanet' + i;
        let planetElement = document.getElementById(planetId);
        let isPlanetUnlocked = userXP >= i * xpPerPlanet;

        // Remove any previously set event listeners to avoid duplicates
        planetElement.removeEventListener('click', planetClickHandler);

        // Set the correct image based on XP and add the event listener
        if (isPlanetUnlocked) {
            changePlanetImage(planetId, activatedPlanetId);
            planetElement = document.getElementById(activatedPlanetId); // Update the reference to the unlocked planet
        }

        // Attach the click event handler to the correct element (locked or unlocked)
        planetElement.addEventListener('click', function() {
            planetClickHandler(i, isPlanetUnlocked);
        });
    }
    changeBackgroundImage(userXP);
}


function openPlanetStory(planetNumber, isUnlocked) {
    let storyPage;

    // Determine the planet name and construct the file name based on its unlocked status
    switch (planetNumber) {
        case 1:
            storyPage = 'cosmo';
            break;
        case 2:
            storyPage = 'wanda';
            break;
        case 3:
            storyPage = 'cryo';
            break;
        case 4:
            storyPage = 'aurora';
            break;
        case 5:
            storyPage = 'micky';
            break;
        case 6:
            storyPage = 'pluto';
            break;
        default:
            console.error('Invalid planet number: ' + planetNumber);
            return;
    }

    storyPage += isUnlocked ? 'Unlocked.html' : 'Locked.html';

    // Redirect to the story page
    window.location.href = `adventureMap_styling/storyPages/${storyPage}`;
}


// Event handler for clicking on a planet
function planetClickHandler(planetNumber, isUnlocked) {
    if (planetNumber === 7 && isUnlocked) {
        // If planet 7 is clicked and it is unlocked (userXP is at least 70), open the ending page
        window.location.href = 'adventureMapEnding/adventureMapEnding.html';
    } else {
        // For all other planets, open the unlocked or locked story page
        openPlanetStory(planetNumber, isUnlocked);
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

