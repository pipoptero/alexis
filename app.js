const modes = {
  add1: {
    title: "Sumas rápidas",
    mission: "Suma rápido.",
    make() {
      const a = rand(0, 9);
      const b = rand(0, 9);
      return { text: `${a} + ${b}`, answer: a + b };
    }
  },
  sub1: {
    title: "Restas rápidas",
    mission: "Resta rápido.",
    make() {
      const a = rand(0, 9);
      const b = rand(0, a);
      return { text: `${a} - ${b}`, answer: a - b };
    }
  },
  make10: {
    title: "Amigos del 10",
    mission: "Busca el amigo.",
    make() {
      const a = rand(0, 10);
      return { text: `${a} + ? = 10`, answer: 10 - a };
    }
  },
  sub10: {
    title: "Restar hasta 10",
    mission: "Quita y acierta.",
    make() {
      const answer = rand(0, 10);
      const result = rand(0, 10 - answer);
      return { text: `${answer + result} - ? = ${result}`, answer };
    }
  },
  add2: {
    title: "Dos cifras suma",
    mission: "Suma sin llevar.",
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
    mission: "Resta sin llevar.",
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
  answerMode: "choice",
  stars: 0,
  streak: 0,
  round: 1,
  maxRounds: 10,
  current: null,
  locked: false
};

const els = {
  modeTitle: document.querySelector("#mode-title"),
  missionText: document.querySelector("#mission-text"),
  problem: document.querySelector("#problem"),
  answer: document.querySelector("#answer"),
  check: document.querySelector("#check"),
  answerRow: document.querySelector(".answer-row"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  stars: document.querySelector("#stars"),
  streak: document.querySelector("#streak"),
  round: document.querySelector("#round"),
  fuel: document.querySelector("#fuel"),
  modeButtons: document.querySelectorAll(".mode-button"),
  practiceButtons: document.querySelectorAll(".practice-button"),
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

  state.locked = false;
  state.current = modes[state.mode].make();
  els.modeTitle.textContent = modes[state.mode].title;
  els.missionText.textContent = modes[state.mode].mission;
  els.problem.textContent = state.current.text;
  els.answer.value = "";
  els.feedback.textContent = state.answerMode === "write" ? "Escribe el resultado y pulsa comprobar." : "Toca la respuesta correcta.";
  els.feedback.className = "feedback";
  updateAnswerMode();
  renderChoices();
  updateScore();
}

function updateScore() {
  els.stars.textContent = state.stars;
  els.streak.textContent = state.streak;
  els.round.textContent = `${state.round}/${state.maxRounds}`;
  const fuel = Math.max(0, 100 - ((state.round - 1) / state.maxRounds) * 100);
  els.fuel.style.width = `${fuel}%`;
}

function submitAnswer(value, empty = false) {
  if (state.locked) return;

  if (empty || Number.isNaN(value)) {
    els.feedback.textContent = "Pon un número primero.";
    els.feedback.className = "feedback try";
    return;
  }

  state.locked = true;
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

function checkAnswer() {
  const value = Number(els.answer.value);
  submitAnswer(value, els.answer.value.trim() === "");
}

function setMode(mode) {
  state.mode = mode;
  if (state.answerMode === "friends") {
    state.answerMode = "choice";
  }
  els.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
  els.practiceButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.answerMode === state.answerMode);
  });
  newProblem(true);
}

function setAnswerMode(answerMode) {
  state.answerMode = answerMode;
  if (answerMode === "friends") {
    state.mode = "make10";
  }

  els.practiceButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.answerMode === answerMode);
  });

  els.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });

  newProblem(true);
}

function updateAnswerMode() {
  const writing = state.answerMode === "write";
  els.answerRow.hidden = !writing;
  els.choices.hidden = writing;
}

function renderChoices() {
  if (state.answerMode === "write") {
    els.choices.innerHTML = "";
    return;
  }

  const options = makeOptions(state.current.answer);
  els.choices.innerHTML = options.map((option) => (
    `<button class="choice-button" data-choice="${option}">${option}</button>`
  )).join("");
}

function makeOptions(answer) {
  const values = new Set([answer]);
  const max = answer <= 10 ? 10 : Math.min(99, answer + 12);
  const min = Math.max(0, answer - 12);

  while (values.size < 4) {
    const near = answer + rand(-5, 5);
    const candidate = Math.max(min, Math.min(max, near));
    values.add(candidate);
  }

  return Array.from(values).sort(() => Math.random() - 0.5);
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

els.practiceButtons.forEach((button) => {
  button.addEventListener("click", () => setAnswerMode(button.dataset.answerMode));
});

els.check.addEventListener("click", checkAnswer);
els.answer.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAnswer();
  }
});

els.choices.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  submitAnswer(Number(button.dataset.choice));
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
