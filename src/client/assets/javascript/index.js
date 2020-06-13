// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad();
	setupClickHandlers();
});

async function onPageLoad() {
	getTracks()
		.then(tracks => {
			const html = renderTrackCards(tracks);
			renderAt('#tracks', html);
		});

	getRacers()
		.then((racers) => {
			const html = renderRacerCars(racers);
			renderAt('#racers', html)
		})
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event;

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target);
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target);
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault();
	
			// start race
			handleCreateRace();
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	return await new Promise(resolve => setTimeout(resolve, ms));
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race
async function handleCreateRace() {
	// render starting UI
	renderAt('#race', renderRaceStartView(store.track_id));

	const race = createRace(store.player_id, store.track_id);
	store.race_id = race.id;

	// The race has been created, now start the countdown
	runCountdown();
	startRace(race.id);
	runRace(race.id);
}

async function runRace(raceID) {
	return new Promise(resolve => {
		raceInterval = setInterval(raceInfo, 500);

		function raceInfo() {
			const race = getRace(raceID);

			if (race.status === 'in-progress') {
				renderAt('#leaderBoard', raceProgress(res.positions));
			} else if (race.status === 'finished') {
				clearInterval(raceInterval);
				renderAt('#race', resultsView(res.positions));
				resolve(res);
			}
		}
	})
}

async function runCountdown() {
	// wait for the DOM to load
	await delay(1000);
	let timer = 3;

	return new Promise(resolve => {
		countDownInterval = setInterval(runCountdown, 1000);

		// run this DOM manipulation to decrement the countdown for the user
		document.getElementById('big-numbers').innerHTML = --timer;

		if (timer === 0) {
			clearInterval(countDownInterval);
			resolve(res);
		}
	})
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id);

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected');
	if(selected) {
		selected.classList.remove('selected');
	}

	// add class selected to current target
	target.classList.add('selected');
	store.race_id = target.id;
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id);

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected');
	if(selected) {
		selected.classList.remove('selected');
	}

	// add class selected to current target
	target.classList.add('selected');
	store.track_id = target.id;
}

function handleAccelerate() {
	console.log("accelerate button clicked");
	accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!tracks.length) {
		return `
			<h4>Loading Racers...</h4>
		`
	}

	const results = racers.map(renderRacerCard).join('');

	return `<ul id="racers">${results}</ul>`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</h4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track;

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element);

	node.innerHTML = html;
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

function getTracks() {
	const tracksURL = `${SERVER}/api/tracks`;

	return fetch(tracksURL)
		.then(res => res.json())
		.then(tracks => {return tracks});
}

function getRacers() {
	const racersURL = `${SERVER}/api/cars`;

	return fetch(racersURL)
		.then(res => res.json())
		.then(cars => {return cars});
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id);
	track_id = parseInt(track_id);
	const body = { player_id, track_id };

	return fetch(`${SERVER}/api/races`, {
		...defaultFetchOpts(),
		method: 'POST',
		dataType: 'jsonp',
		body: JSON.stringify(body)
	}).then(res => res.json()).then(race => {return race});
}

function getRace(id) {
	const raceURL = `${SERVER}/api/races/${id}`;

	return fetch(raceURL)
		.then(res => res.json())
		.then(race => {return race});
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		...defaultFetchOpts(),
		method: 'POST',
		mode: 'cors',
	})
}

function accelerate(id) {
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		...defaultFetchOpts(),
		method: 'POST',
	})
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body, datatype, or cors needed for this request
}
