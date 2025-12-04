// regebbi projektekbol kiszedett funkciok

/**
 * Fade an element in or out while moving it slightly up/down.
 *
 * @param {HTMLElement} el - element to animate
 * @param {'in'|'out'} mode - "in"  -> fade‑in & slide‑up,
 *                            "out" -> fade‑out & slide‑down
 * @param {Array<number>} bezier - [x1, y1, x2, y2] cubic‑bezier control points
 * @param {number} duration - animation length in ms
 * @param {string?} customEnd - optional arg for specifying a custom end position
 * @returns {Promise} - resolves when the animation finishes
 */
export function fadeSlide(el, mode, bezier, duration, customEnd) {
	if (!(el instanceof HTMLElement)) {
		throw new TypeError("First argument must be an HTMLElement");
	}
	if (!["in", "out"].includes(mode)) {
		throw new TypeError('Mode must be "in" or "out"');
	}
	if (!Array.isArray(bezier) || bezier.length !== 4) {
		throw new TypeError("Bezier must be an array of four numbers");
	}

	const isIn = mode === "in";
	const startOpacity = isIn ? 0 : 1;
	const endOpacity = isIn ? 1 : 0;

	const distance = 20; // how far the element moves
	const startY = isIn ? distance : 0; // start position
	const endY = isIn ? 0 : distance; // end position

	const keyframes = [
		{
			opacity: startOpacity,
			transform: `translateY(${startY}px)`,
		},
		{
			opacity: endOpacity,
			transform: `translateY(${customEnd ? customEnd : `${endY}px`})`,
		},
	];

	const options = {
		duration,
		easing: `cubic-bezier(${bezier.join(",")})`,
		fill: "forwards", // keep final state after animation
	};

	const animation = el.animate(keyframes, options);

	// Return a promise that resolves when the animation finishes
	return animation.finished;
}

/**
 * Animate a set of Roboto Flex variation settings on an element.
 *
 * @param {HTMLElement} el - element whose font will be animated
 * @param {Array<number>} bezier - [x1, y1, x2, y2] cubic‑bezier control points
 * @param {number} duration - animation length in ms
 * @param {Object} fromSettings - variation object for the start state
 * @param {Object} toSettings - variation object for the end state
 */
export function animateFontVariation(
	el,
	bezier,
	duration,
	fromSettings,
	toSettings,
) {
	const buildString = (obj) =>
		Object.entries(obj)
			.map(([k, v]) => `"${k}" ${v}`)
			.join(", ");

	const lerp = (a, b, t) => a + (b - a) * t;
	let start = null;

	function step(timestamp) {
		if (!start) start = timestamp;
		const elapsed = timestamp - start;
		const progress = Math.min(elapsed / duration, 1); // 0 → 1
		const easedProgress = cubicBezier(progress, ...bezier);

		const current = {};
		for (const key of Object.keys(fromSettings)) {
			const from = fromSettings[key];
			const to = toSettings[key];
			current[key] = lerp(from, to, easedProgress);
		}

		el.style.fontVariationSettings = buildString(current);

		if (elapsed < duration) {
			requestAnimationFrame(step);
		}
	}

	requestAnimationFrame(step);
}

/**
 * Cubic‑bezier evaluator – returns eased t for a given linear t.
 * Implementation based on the algorithm used by CSS (see MDN).
 *
 * @param {number} t   – linear progress (0‑1)
 * @param {number} p0  – x1
 * @param {number} p1  – y1
 * @param {number} p2  – x2
 * @param {number} p3  – y2
 * @returns {number}
 */
function cubicBezier(t, p0, p1, p2, p3) {
	const cx = 3 * p0;
	const bx = 3 * (p2 - p0) - cx;
	const ax = 1 - cx - bx;

	const cy = 3 * p1;
	const by = 3 * (p3 - p1) - cy;
	const ay = 1 - cy - by;

	let x = t,
		i = 0;
	while (i < 5) {
		const xCalc = ((ax * x + bx) * x + cx) * x;
		const dx = (3 * ax * x + 2 * bx) * x + cx;
		if (dx === 0) break;
		x = x - (xCalc - t) / dx;
		i++;
	}
	const y = ((ay * x + by) * x + cy) * x;
	return y;
}

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

const states = [rck, ppr, scr];
const bezier = [0.27, 1.06, 0.18, 1.0];
const duration = 750;

function startRandomCycle() {
	const elems = Array.from(document.querySelectorAll(".textanim")); // exactly 3
	if (elems.length !== 3) return console.warn("Expected 3 .textanim elements");

	function getShuffledStates() {
		const shuffled = states.slice();
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	const triggerDelay = 3 * duration + 3 * 150;
	setInterval(runSequence, triggerDelay);

	function runSequence() {
		const shuffled = getShuffledStates();

		let i = 0;
		function animateNext() {
			if (i >= elems.length) return;

			const el = elems[i];
			const from = states[i];
			const to = shuffled[i];

			animateFontVariation(el, bezier, duration, from, to);
			states[i] = shuffled[i];

			i++;
			setTimeout(animateNext, 150);
		}

		animateNext();
	}
}

document.addEventListener("DOMContentLoaded", startRandomCycle);
