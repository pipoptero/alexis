const modes = {
  add1: {
    title: "Sumas rápidas",
    mission: "Suma los números antes de que el cohete pierda combustible.",
    make() {
      const a = rand(0, 9);
      const b = rand(0, 9);
      return { text: `${a} + ${b}`, answer: a + b };
    }
  },
  sub1: {
    title: "Restas rápidas",
    mission: "Resta sin que el resultado baje de cero.",
    make() {
      const a = rand(0, 9);
      const b = rand(0, a);
      return { text: `${a} - ${b}`, answer: a - b };
    }
  },
  make10: {
    title: "Amigos del 10",
    mission: "Encuentra el numero amigo que completa 10.",
    make() {
      const a = rand(0, 10);
      return { text: `${a} + ? = 10`, answer: 10 - a };
    }
  },
  sub10: {
    title: "Restar hasta 10",
    mission: "Descubre cuánto hay que quitar para llegar al resultado.",
    make() {
      const answer = rand(0, 10);
      const result = rand(0, 10 - answer);
      return { text: `${answer + result} - ? = ${result}`, answer };
    }
  },
  add2: {
    title: "Dos cifras suma",
    mission: "Suma dos cifras sin llevar.",
    make() {
      const onesA = rand(0, 8);
      const onesB = rand(0, 9 - onesA);
      const tensA = rand(1, 8);
      const tensB = rand(1, 9 - tensA);
      const a = tensA * 10 + onesA;
      const b = tensB * 10 + onesB;
      return { text: `${a} + ${b}`, answer: a + b };
    }
  },
  sub2: {
    title: "Dos cifras resta",
    mission: "Resta dos cifras sin pedir prestado.",
    make() {
      const tensA = rand(2, 9);
      const tensB = rand(1, tensA);
      const onesA = rand(0, 9);
      const onesB = rand(0, onesA);
      const a = tensA * 10 + onesA;
      const b = tensB * 10 + onesB;
      return { text: `${a} - ${b}`, answer: a - b };
    }
  }
};

const state = {
  mode: "add1",
  stars: 0,
  streak: 0,
  round: 1,
  maxRounds: 10,
  current: null
};

const els = {
  modeTitle: document.querySelector("#mode-title"),
  missionText: document.querySelector("#mission-text"),
  problem: document.querySelector("#problem"),
  answer: document.querySelector("#answer"),
  check: document.querySelector("#check"),
  feedback: document.querySelector("#feedback"),
  stars: document.querySelector("#stars"),
  streak: document.querySelector("#streak"),
  round: document.querySelector("#round"),
  fuel: document.querySelector("#fuel"),
  modeButtons: document.querySelectorAll(".mode-button"),
  keypad: document.querySelector(".keypad"),
  newRound: document.querySelector("#new-round"),
  practiceList: document.querySelector("#practice-list"),
  tenWall: document.querySelector("#ten-wall"),
  pairs: document.querySelector("#pairs"),
  missionCard: document.querySelector(".mission-card")
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newProblem(resetRound = false) {
  if (resetRound) {
    state.round = 1;
    state.streak = 0;
  }

  state.current = modes[state.mode].make();
  els.modeTitle.textContent = modes[state.mode].title;
  els.missionText.textContent = modes[state.mode].mission;
  els.problem.textContent = state.current.text;
  els.answer.value = "";
  els.feedback.textContent = "Tu turno. Piensa rápido y dispara la respuesta.";
  els.feedback.className = "feedback";
  updateScore();
  els.answer.focus();
}

function updateScore() {
  els.stars.textContent = state.stars;
  els.streak.textContent = state.streak;
  els.round.textContent = `${state.round}/${state.maxRounds}`;
  const fuel = Math.max(0, 100 - ((state.round - 1) / state.maxRounds) * 100);
  els.fuel.style.width = `${fuel}%`;
}

function checkAnswer() {
  const value = Number(els.answer.value);
  if (els.answer.value.trim() === "" || Number.isNaN(value)) {
    els.feedback.textContent = "Pon un numero primero.";
    els.feedback.className = "feedback try";
    return;
  }

  if (value === state.current.answer) {
    const bonus = state.streak >= 2 ? 2 : 1;
    state.stars += bonus;
    state.streak += 1;
    els.feedback.textContent = bonus === 2 ? "Perfecto. Racha turbo: ganas 2 estrellas." : "Correcto. El cohete sube.";
    els.feedback.className = "feedback good";
    els.missionCard.classList.remove("celebrate");
    void els.missionCard.offsetWidth;
    els.missionCard.classList.add("celebrate");
    beep(660, 0.08);

    window.setTimeout(() => {
      state.round = state.round >= state.maxRounds ? 1 : state.round + 1;
      newProblem();
    }, 850);
    return;
  }

  state.streak = 0;
  els.feedback.textContent = `Casi. Era ${state.current.answer}. Probamos otra.`;
  els.feedback.className = "feedback try";
  beep(220, 0.12);
  window.setTimeout(() => {
    state.round = state.round >= state.maxRounds ? 1 : state.round + 1;
    newProblem();
  }, 1250);
}

function setMode(mode) {
  state.mode = mode;
  els.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  newProblem(true);
}

function fillPairs() {
  const pairs = [];
  for (let i = 0; i <= 10; i += 1) {
    pairs.push(`${i} + ${10 - i}`);
  }
  els.pairs.innerHTML = pairs.map((pair) => `<div class="pair">${pair} = 10</div>`).join("");
}

function beep(frequency, duration) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gain.gain.setValueAtTime(0.04, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

els.check.addEventListener("click", checkAnswer);
els.answer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

els.keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) {
    els.answer.value = `${els.answer.value}${button.dataset.number}`.slice(0, 3);
  }

  if (button.dataset.action === "clear") {
    els.answer.value = "";
  }

  if (button.dataset.action === "enter") {
    checkAnswer();
  }

  els.answer.focus();
});

els.newRound.addEventListener("click", () => {
  state.stars = 0;
  state.streak = 0;
  newProblem(true);
});

els.practiceList.addEventListener("click", () => {
  els.tenWall.scrollIntoView({ behavior: "smooth", block: "start" });
});

fillPairs();
newProblem(true);
