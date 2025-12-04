import { animateFontVariation, fadeSlide } from "/scripts/animations.module.js";

function numberToWords(num) {
	if (typeof num !== "number" || !Number.isFinite(num) || num < 0) {
		throw new TypeError("Input must be a non-negative finite number");
	}
	if (num === 0) return "zero";

	const units = [
		"",
		"one",
		"two",
		"three",
		"four",
		"five",
		"six",
		"seven",
		"eight",
		"nine",
		"ten",
		"eleven",
		"twelve",
		"thirteen",
		"fourteen",
		"fifteen",
		"sixteen",
		"seventeen",
		"eighteen",
		"nineteen",
	];
	const tens = [
		"",
		"",
		"twenty",
		"thirty",
		"forty",
		"fifty",
		"sixty",
		"seventy",
		"eighty",
		"ninety",
	];
	const scales = ["", "thousand", "million"];

	const groups = [];
	let n = Math.floor(num);
	while (n > 0) {
		groups.push(n % 1000);
		n = Math.floor(n / 1000);
	}

	const words = [];

	for (let i = groups.length - 1; i >= 0; i--) {
		const three = groups[i];
		if (three === 0) continue; // skip empty groups

		const h = Math.floor(three / 100);
		const t = three % 100;

		const segment = [];

		if (h > 0) {
			segment.push(`${units[h]} hundred`);
		}

		if (t > 0) {
			if (t < 20) {
				segment.push(units[t]);
			} else {
				const ten = Math.floor(t / 10);
				const unit = t % 10;
				segment.push(tens[ten] + (unit ? `-${units[unit]}` : ""));
			}
		}

		const scale = scales[i];
		if (scale) segment.push(scale);

		words.push(segment.join(" "));
	}

	return words.join(" ");
}

let round = 0;

const rck = {
	wght: 800,
	GRAD: -60,
	slnt: 0,
	wdth: 25,
	XOPQ: 100,
	YOPQ: 25,
	XTRA: 480,
	YTUC: 712,
	YTLC: 514,
	YTAS: 750,
	YTDE: -203,
	YTFI: 738,
};

const ppr = {
	wght: 500,
	GRAD: 0,
	slnt: -5,
	wdth: 25,
	XOPQ: 70,
	YOPQ: 25,
	XTRA: 540,
	YTUC: 712,
	YTLC: 514,
	YTAS: 750,
	YTDE: -300,
	YTFI: 738,
};

const scr = {
	wght: 500,
	GRAD: 0,
	slnt: -5,
	wdth: 50,
	XOPQ: 27,
	YOPQ: 135,
	XTRA: 540,
	YTUC: 712,
	YTLC: 514,
	YTAS: 750,
	YTDE: -300,
	YTFI: 738,
};

let current = null;

const states = [rck, ppr, scr];

function getRandomState() {
	const data = states[Math.floor(Math.random() * states.length)];
	if (current === data) return getRandomState();
	return data;
}

/// -------------------------------------
/// game code START
/// -------------------------------------

function robotChoice() {
	const options = ["rock", "paper", "scissors"];
	return options[Math.floor(Math.random() * options.length)];
}

function decideWinner(player, robot) {
	if (player === robot) return "draw";

	const winsAgainst = {
		rock: "scissors",
		paper: "rock",
		scissors: "paper",
	};
	return winsAgainst[player] === robot ? "win" : "lose";
}

let humanScore = 0;
let robotScore = 0;

async function updateScoreDisplays(whom) {
	const humanEl = document.getElementById("human-score");
	const robotEl = document.getElementById("robot-score");

	if (whom === "human")
		await fadeSlide(humanEl, "out", [0.27, 1.06, 0.18, 1.0], 350);
	else await fadeSlide(robotEl, "out", [0.27, 1.06, 0.18, 1.0], 350);

	if (humanEl) humanEl.textContent = humanScore;
	if (robotEl) robotEl.textContent = robotScore;

	if (whom === "human")
		await fadeSlide(humanEl, "in", [0.27, 1.06, 0.18, 1.0], 350);
	else await fadeSlide(robotEl, "in", [0.27, 1.06, 0.18, 1.0], 350);
}

function flashWinner(winner) {
	const humanEl = document.querySelector(".player.human");
	const robotEl = document.querySelector(".player.robot");

	humanEl?.classList.remove("flash-win", "flash-lose");
	robotEl?.classList.remove("flash-win", "flash-lose");

	if (winner === "draw") return;

	const winEl = winner === "human" ? humanEl : robotEl;
	const loseEl = winner === "human" ? robotEl : humanEl;

	winEl?.classList.add("flash-win");
	loseEl?.classList.add("flash-lose");

	setTimeout(() => {
		winEl?.classList.remove("flash-win");
		loseEl?.classList.remove("flash-lose");
	}, 300);
}

function showResult(player, robot, outcome) {
	// update scores
	if (outcome === "win") humanScore++;
	else if (outcome === "lose") robotScore++;
	if (outcome !== "draw") updateScoreDisplays(outcome === "win" ? "human" : "robot");

	// flash colors
	const winner =
		outcome === "draw" ? "draw" : outcome === "win" ? "human" : "robot";
	flashWinner(winner);
}

function initRPSControls() {
	const buttons = document.querySelectorAll(".controls .button[data-item]");
	buttons.forEach((btn) => {
		btn.addEventListener("click", () => {
			const playerPick = btn.dataset.item;
			const robotPick = robotChoice();
			const outcome = decideWinner(playerPick, robotPick);
			incrementRound();
			showResult(playerPick, robotPick, outcome);
		});
	});
}

/// -------------------------------------
/// game code END
/// -------------------------------------

function incrementRound() {
	round++;
	const roundNumContainer = document.getElementById("roundnum");
	roundNumContainer.textContent = numberToWords(round);
	const newState = getRandomState();
	animateFontVariation(
		roundNumContainer,
		[0.27, 1.06, 0.18, 1.0],
		750,
		current || getRandomState(),
		newState,
	);
	current = newState;
}

document.addEventListener("DOMContentLoaded", (_) => {
	const startButton = document.querySelector("button.start");
	startButton.addEventListener("click", async (e) => {
		e.preventDefault();

		const titleCard = document.querySelector("div.card.title");
		const gameCard = document.querySelector("div.card.game");
		fadeSlide(titleCard, "out", [0.27, 1.06, 0.18, 1.0], 350);
		fadeSlide(gameCard, "in", [0.27, 1.06, 0.18, 1.0], 350, "-50%");
		titleCard.style.pointerEvents = "none";

		const roundNumContainer = document.getElementById("roundnum");
		roundNumContainer.textContent = numberToWords(round);
		const newState = getRandomState();
		animateFontVariation(
			roundNumContainer,
			[0.27, 1.06, 0.18, 1.0],
			750,
			current || getRandomState(),
			newState,
		);
		current = newState;

		initRPSControls();
	});
});
