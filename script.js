const body = document.body;


const header = document.createElement('header');
const burgerBtn = document.createElement('button');
burgerBtn.className = 'burger-btn';
burgerBtn.innerHTML = '<span></span><span></span><span></span>';
header.appendChild(burgerBtn);

const logo = document.createElement('div');
logo.textContent = 'STATIC_PROTOCOL';
logo.style.cssText = 'margin-left: 20px; font-weight: bold; letter-spacing: 3px; font-size: 0.8rem; color: #888;';
header.appendChild(logo);

body.appendChild(header);

const overlayBg = document.createElement('div');
overlayBg.className = 'overlay-bg';
body.appendChild(overlayBg);

const appShell = document.createElement('div');
appShell.className = 'app-shell';
body.appendChild(appShell);

const sidebar = document.createElement('div');
sidebar.className = 'sidebar';
appShell.appendChild(sidebar);

const main = document.createElement('div');
main.className = 'main-content';
appShell.appendChild(main);

const toggleMenu = () => {
    sidebar.classList.toggle('active');
    overlayBg.classList.toggle('active');
};

burgerBtn.onclick = toggleMenu;
overlayBg.onclick = toggleMenu;

const renderSidebar = () => {
    sidebar.innerHTML = "";
    for (let i = 1; i <= 12; i++) {
        const weekBtn = document.createElement("button");
        weekBtn.textContent = `Неделя_${String(i).padStart(2, '0')}`;
        weekBtn.classList.add("sidebar-btn");
        if (appState.currentWeek === i) weekBtn.classList.add('active');

        weekBtn.addEventListener("click", () => {
            appState.currentWeek = i;
            renderMainContent();
            renderSidebar();
            toggleMenu();
        });
        sidebar.appendChild(weekBtn);
    }
};

const stoicQuotes = [
    "Препятствие становится путем. — Марк Аврелий",
    "Трудности укрепляют разум, как труд укрепляет тело. — Сенека",
    "Сначала скажи себе, каким ты хочешь быть, а затем делай то, что должен. — Эпиктет",
    "Тот, кто победил свои желания, более храбр, чем тот, кто победил своих врагов. — Аристотель"
];

const showSuccessModal = () => {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: #1a1a1a; color: white; padding: 30px;
        border: 2px solid #00ff41; z-index: 2000; text-align: center;
        width: 90%; max-width: 400px;
    `;

    const randomQuote = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];

    modal.innerHTML = `
        <h2>ТРЕНИРОВКА ЗАВЕРШЕНА</h2>
        <p style="font-style: italic; margin: 20px 0;">"${randomQuote}"</p>
        <button id="accept-success" style="padding: 10px 20px; background: #00ff41; color: black; border: none; font-weight: bold; cursor: pointer;">ПРИНЯТЬ УСПЕХ</button>
    `;

    document.body.appendChild(modal);

    document.getElementById('accept-success').onclick = () => {
        modal.remove();
        renderMainContent();
    };
};

const toggleProgress = (id, isChecked) => {
    const progress = JSON.parse(localStorage.getItem('workoutProgress')) || {};

    progress[id] = isChecked;

    localStorage.setItem('workoutProgress', JSON.stringify(progress));
};

const playBeep = (frequency = 440, duration = 0.1) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
};

const appState = {
    currentWeek: Number(localStorage.getItem('lastWeek')) || 1,
    currentExerciseIndex: Number(localStorage.getItem('currentExIndex')) || 0,
    currentSet: 1,
    isAdmin: localStorage.getItem('adminStatus') === 'true',
    workoutData: {
        exercises: [
            {id: 1, name: "ПРИСЕД У СТЕНЫ", tech: "Скользи по стене... Колени 90 градусов..."},
            {id: 2, name: "ПЛАНКА", tech: "Локти под плечами... Сожми ягодицы..."},
            {id: 3, name: "ОБРАТНАЯ ПЛАНКА", tech: "Упор в пятки, носки на себя... Руки за спиной..."},
            {id: 4, name: "УДЕРЖАНИЕ В ОТЖИМАНИИ", tech: "Опустись на половину... Замри..."},
            {id: 5, name: "УДЕРЖАНИЕ В ПОДТЯГИВАНИИ", tech: "Подбородок над перекладиной... Держись..."}
        ],

        phases: [
            {id: "phase1", weeks: [1, 2, 3, 4], sets: 3, work: 30, rest: 90},
            {id: "phase2", weeks: [5, 6, 7, 8], sets: 4, work: 45, rest: 75},
            {id: "phase3", weeks: [9, 10, 11, 12], sets: 5, work: 60, rest: 60}
        ]
    }
};

const saveCurrentEx = (index) => {
    localStorage.setItem('currentExIndex', index);
};

const app = document.createElement('div');
app.style.width = "95%";
app.style.maxWidth = "500px";
app.style.margin = "0 auto";
app.style.textAlign = "center";
document.body.appendChild(app);

const renderMainContent = () => {
    main.innerHTML = "";

    renderProgress(main);
    renderExercise(main);
};

const renderTimerOverlay = (currentPhase, exercise) => {
    const overlay = document.createElement('div');
    overlay.className = 'timer-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: black;
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    overlay.innerHTML = `
        <h2 id="overlay-ex-name" style="font-size: 2rem; text-align: center">${exercise.name}</h2>
        <p id="overlay-status" style="font-size: 1.5rem; color: #aaa;">Приготовься</p>
        <h1 id="overlay-timer" style="font-size: 30vw;">5</h1>
        <p id="overlay-sets" style="font-size: 1.5rem;">Подход: 1 / ${currentPhase.sets}</p>
        <button id="stop-workout" style="margin-top: 20px; padding: 10px 20px; background: #444; color: white; border: none;">ПРЕРВАТЬ</button>
    `;

    document.body.appendChild(overlay);

    startLogic(overlay, currentPhase);
};

const renderProgress = (parent) => {
    const progressBlock = document.createElement('div');
    progressBlock.className = 'progress-block';
    progressBlock.innerHTML = '<h3>Твой прогресс:</h3>';

    const savedProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};

    const days = ["Пн", "Ср", "Пт"];
    days.forEach(day => {
        const label = document.createElement('label');
        const checkId = `week-${appState.currentWeek}-${day}`;

        const isChecked = savedProgress[checkId] ? "checked" : "";

        label.innerHTML = `
            <span>${day}</span>
            <input type="checkbox" id="${checkId}" ${isChecked}>
        `;

        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
            toggleProgress(checkId, e.target.checked);
        });

        progressBlock.appendChild(label);
    });

    parent.appendChild(progressBlock);
};

const renderExercise = (parent) => {
    const currentPhase = appState.workoutData.phases.find(p => p.weeks.includes(appState.currentWeek));
    const ex = appState.workoutData.exercises[appState.currentExerciseIndex];

    const exCard = document.createElement('div');
    exCard.className = 'exercise-card';

    exCard.innerHTML = `
        <div class="ex-nav" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <button id="prev-ex" class="nav-btn" ${appState.currentExerciseIndex === 0 ? 'disabled' : ''}> < </button>
            <span style="font-size: 0.7rem; color: #555;">УПРАЖНЕНИЕ ${appState.currentExerciseIndex + 1} / 5</span>
            <button id="next-ex" class="nav-btn" ${appState.currentExerciseIndex === 4 ? 'disabled' : ''}> > </button>
        </div>
        <h2>${ex.name}</h2>
        <div class="stats">
            <span>Подходы: ${currentPhase.sets}</span> | 
            <span>Работа: ${currentPhase.work}с</span> | 
            <span>Отдых: ${currentPhase.rest}с</span>
        </div>
        <p class="tech-text">${ex.tech}</p>
        <button id="start-workout-btn" class="start-btn">Начать цикл</button>
    `;

    exCard.querySelector('#prev-ex').onclick = () => {
        if (appState.currentExerciseIndex > 0) {
            appState.currentExerciseIndex--;
            saveCurrentEx(appState.currentExerciseIndex);
            renderMainContent();
        }
    };

    exCard.querySelector('#next-ex').onclick = () => {
        if (appState.currentExerciseIndex < 4) {
            appState.currentExerciseIndex++;
            saveCurrentEx(appState.currentExerciseIndex);
            renderMainContent();
        }
    };

    const startBtn = exCard.querySelector('#start-workout-btn');
    startBtn.addEventListener('click', () => {
        renderTimerOverlay(currentPhase, ex);
    });

    parent.appendChild(exCard);
};

const startLogic = (overlay, phase) => {
    let currentSet = 1;
    let timeLeft = 5;
    let mode = 'PREP_WORK';

    const timerEl = overlay.querySelector('#overlay-timer');
    const statusEl = overlay.querySelector('#overlay-status');
    const setsEl = overlay.querySelector('#overlay-sets');

    const interval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 3 && timeLeft > 0) {
            playBeep(2000, 0.1);
        }

        if (timeLeft <= 0) {
            playBeep(2700, 0.3);

            if (mode === 'PREP_WORK') {
                mode = 'WORK';
                timeLeft = phase.work;
                statusEl.textContent = 'РАБОТАЙ!';
                overlay.style.background = '#1a4a1a';
            } else if (mode === 'WORK') {
                mode = 'PREP_REST';
                timeLeft = 5;
                statusEl.textContent = 'ЗАКОНЧИЛ';
                overlay.style.background = 'black';
            } else if (mode === 'PREP_REST') {
                mode = 'REST';
                timeLeft = phase.rest;
                statusEl.textContent = 'ОТДЫХ';
                overlay.style.background = '#4a1a1a';
            } else if (mode === 'REST') {
                if (currentSet < phase.sets) {
                    currentSet++;
                    mode = 'PREP_WORK';
                    timeLeft = 5;
                    statusEl.textContent = 'ПРИГОТОВЬСЯ';
                    setsEl.textContent = `Подход: ${currentSet} / ${phase.sets}`;
                    overlay.style.background = 'black';
                } else {
                    clearInterval(interval);
                    overlay.remove();

                    if (appState.currentExerciseIndex < appState.workoutData.exercises.length - 1) {
                        appState.currentExerciseIndex++;
                        saveCurrentEx(appState.currentExerciseIndex);
                        renderMainContent();
                    } else {
                        showSuccessModal();

                        appState.currentExerciseIndex = 0;
                        saveCurrentEx(0);
                    }
                }
            }
        }
    }, 1000);

    overlay.querySelector('#stop-workout').onclick = () => {
        clearInterval(interval);
        overlay.remove();
    };
};

renderSidebar();
renderMainContent();