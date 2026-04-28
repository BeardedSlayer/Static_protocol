const osContainer = document.getElementById('os-container');
const appState = {
    currentWeek: Number(localStorage.getItem('lastWeek')) || 1,
    currentExerciseIndex: Number(localStorage.getItem('currentExIndex')) || 0,
    currentSet: 1,
    workoutData: {
        exercises: [
            {id: 1, name: "ПРИСЕД У СТЕНЫ", tech: "Скользи по стене... Колени 90 градусов..."},
            {id: 2, name: "ПЛАНКА", tech: "Локти под плечами... Сожми ягодицы..."},
            {id: 3, name: "ЯГОДИЧНЫЙ МОСТ ОТ СКАМЬИ", tech: "Лопатки на скамье, ноги 90 градусов... Сожми ягодицы..."},
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

const header = document.createElement('header');
header.style.display = 'none';
header.innerHTML = `
    <button class="burger-btn"><span></span><span></span><span></span></button>
    <div style="margin-left: 20px; font-weight: bold; letter-spacing: 3px; font-size: 0.8rem; color: #888;">STATIC_PROTOCOL</div>
`;
osContainer.appendChild(header);

const appShell = document.createElement('div');
appShell.className = 'app-shell';
appShell.style.display = 'none';
osContainer.appendChild(appShell);

const sidebar = document.createElement('div');
sidebar.className = 'sidebar';
appShell.appendChild(sidebar);

const main = document.createElement('div');
main.className = 'main-content';
appShell.appendChild(main);

const overlayBg = document.createElement('div');
overlayBg.className = 'overlay-bg';
osContainer.appendChild(overlayBg);

header.querySelector('.burger-btn').onclick = () => {
    sidebar.classList.toggle('active');
    overlayBg.classList.toggle('active');
};
overlayBg.onclick = () => {
    sidebar.classList.remove('active');
    overlayBg.classList.remove('active');
};

window.switchModule = (moduleName) => {
    const selector = document.getElementById('module-selector');
    if (selector) selector.style.display = 'none';

    header.style.display = 'flex';
    appShell.style.display = 'flex';

    if (moduleName === 'workout') {
        renderWorkoutModule();
    } else if (moduleName === 'discipline') {
        renderDisciplineModule();
    }
};

const renderWorkoutModule = () => {
    main.innerHTML = "";
    renderSidebar();
    renderMainContent();
};

const renderSidebar = () => {
    sidebar.innerHTML = "";
    for (let i = 1; i <= 12; i++) {
        const weekBtn = document.createElement("button");
        weekBtn.textContent = `WEEK_${String(i).padStart(2, '0')}`;
        weekBtn.classList.add("sidebar-btn");
        if (appState.currentWeek === i) weekBtn.classList.add('active');

        weekBtn.addEventListener("click", () => {
            appState.currentWeek = i;
            renderMainContent();
            renderSidebar();
            sidebar.classList.remove('active');
            overlayBg.classList.remove('active');
        });
        sidebar.appendChild(weekBtn);
    }
};

const renderMainContent = () => {
    main.innerHTML = "";
    renderProgress(main);
    renderExercise(main);
};

const renderDisciplineModule = () => {

    main.innerHTML = `
        <div class="discipline-wrapper">
            <div id="uptime-display" class="exercise-card">
                <span style="color: #444; font-size: 0.7rem; letter-spacing: 2px;">SYSTEM_UPTIME</span>
                <h1 id="streak-count" style="font-size: 4rem; color: var(--accent-color);">0</h1>
                <p style="color: #666; font-size: 0.8rem;">DAYS_WITHOUT_BREACH</p>
            </div>
            
            <div id="calendar-root"></div>
            
            <div id="discipline-logs" class="exercise-card" style="margin-top: 20px; display: none;">
                <h3 id="selected-date" style="color: var(--accent-color); font-size: 0.9rem; display: flex; justify-content: center;"></h3>
                <textarea class="log-input" id="log-input" placeholder="Введите отчет о состоянии системы..."></textarea>
                <button id="save-log-btn" class="start-btn" style="margin-top: 10px;">SAVE_LOG</button>
            </div>
            
            <button onclick="location.reload()" class="start-btn" style="background: #222; color: #888; margin-top: 20px;">ВЕРНУТЬСЯ В МЕНЮ</button>
        </div>
    `;

    const initCalendar = () => {
        if (window.VanillaCalendar) {
            const calendar = new window.VanillaCalendar('#calendar-root', {
                settings: {
                    lang: 'ru-RU',
                    selection: {day: 'single'},
                    visibility: {theme: 'dark'},
                },
                actions: {
                    clickDay(event, self) {
                        if (self.selectedDates[0]) showLogInterface(self.selectedDates[0]);
                    },
                },
            });
            calendar.init();
        } else {
            setTimeout(initCalendar, 50);
        }
    };

    initCalendar();
    updateUptimeDisplay();
};

const updateUptimeDisplay = () => {
    const logs = JSON.parse(localStorage.getItem('disciplineLogs')) || {};
    const logEntries = Object.values(logs);

    if (logEntries.length === 0) {
        document.getElementById('streak-count').textContent = "0";
        return;
    }

    const failures = logEntries
        .filter(entry => entry.status === 'fail')
        .sort((a, b) => b.timestamp - a.timestamp);

    const now = new Date().getTime();
    let startDate;

    if (failures.length > 0) {
        startDate = failures[0].timestamp;
    } else {
        const allEntries = logEntries.sort((a, b) => a.timestamp - b.timestamp);
        startDate = allEntries[0].timestamp;
    }

    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    document.getElementById('streak-count').textContent = diffDays;
};

const showLogInterface = (date) => {
    const logSection = document.getElementById('discipline-logs');
    const dateTitle = document.getElementById('selected-date');
    const input = document.getElementById('log-input');
    const container = logSection;

    const saveLog = (date, status, text) => {
        const logs = JSON.parse(localStorage.getItem('disciplineLogs')) || {};
        logs[date] = {
            status: status,
            note: text,
            timestamp: new Date(date).getTime()
        };
        localStorage.setItem('disciplineLogs', JSON.stringify(logs));
        updateUptimeDisplay();
    };

    logSection.style.display = 'block';
    dateTitle.textContent = `LOG_ENTRY: ${date}`;

    const logs = JSON.parse(localStorage.getItem('disciplineLogs')) || {};
    input.value = logs[date]?.note || "";

    logSection.querySelectorAll('button').forEach(b => b.remove());

    const saveBtn = document.createElement('button');
    saveBtn.className = 'start-btn';
    saveBtn.textContent = 'PROTOCOL_ACTIVE';
    saveBtn.style.marginTop = '10px';
    saveBtn.onclick = () => {
        saveLog(date, 'active', input.value);
        logSection.style.display = 'none';
    };

    const breachBtn = document.createElement('button');
    breachBtn.className = 'start-btn';
    breachBtn.style.background = '#ff003c';
    breachBtn.style.marginTop = '10px';
    breachBtn.textContent = 'REPORT_BREACH';
    breachBtn.onclick = () => {
        if(confirm("ПОДТВЕРДИТЬ ВЗЛОМ СИСТЕМЫ? ЭТО СБРОСИТ UPTIME.")) {
            saveLog(date, 'fail', input.value || "Критическая ошибка системы.");
            logSection.style.display = 'none';
        }
    };

    logSection.appendChild(saveBtn);
    logSection.appendChild(breachBtn);
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

const renderProgress = (parent) => {
    const progressBlock = document.createElement('div');
    progressBlock.className = 'progress-block';
    progressBlock.innerHTML = '<h3>Твой прогресс:</h3>';
    const savedProgress = JSON.parse(localStorage.getItem('workoutProgress')) || {};
    ["Пн", "Ср", "Пт"].forEach(day => {
        const label = document.createElement('label');
        const checkId = `week-${appState.currentWeek}-${day}`;
        const isChecked = savedProgress[checkId] ? "checked" : "";
        label.innerHTML = `<span>${day}</span><input type="checkbox" id="${checkId}" ${isChecked}>`;
        label.querySelector('input').onchange = (e) => {
            savedProgress[checkId] = e.target.checked;
            localStorage.setItem('workoutProgress', JSON.stringify(savedProgress));
        };
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
        <div class="ex-nav" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 10px;">
            <button id="prev-ex" class="nav-btn" ${appState.currentExerciseIndex === 0 ? 'disabled' : ''}> < </button>
            <span style="font-size: 0.7rem; color: #555;">УПРАЖНЕНИЕ ${appState.currentExerciseIndex + 1} / 5</span>
            <button id="next-ex" class="nav-btn" ${appState.currentExerciseIndex === 4 ? 'disabled' : ''}> > </button>
        </div>
        <h2>${ex.name}</h2>
        <div class="stats"><span>Подходы: ${currentPhase.sets}</span> | <span>Работа: ${currentPhase.work}с</span> | <span>Отдых: ${currentPhase.rest}с</span></div>
        <p class="tech-text">${ex.tech}</p>
        <button id="start-workout-btn" class="start-btn">Начать цикл</button>
    `;
    exCard.querySelector('#prev-ex').onclick = () => {
        if (appState.currentExerciseIndex > 0) {
            appState.currentExerciseIndex--;
            localStorage.setItem('currentExIndex', appState.currentExerciseIndex);
            renderMainContent();
        }
    };
    exCard.querySelector('#next-ex').onclick = () => {
        if (appState.currentExerciseIndex < 4) {
            appState.currentExerciseIndex++;
            localStorage.setItem('currentExIndex', appState.currentExerciseIndex);
            renderMainContent();
        }
    };
    exCard.querySelector('#start-workout-btn').onclick = () => renderTimerOverlay(currentPhase, ex);
    parent.appendChild(exCard);
};

const renderTimerOverlay = (currentPhase, exercise) => {
    const overlay = document.createElement('div');
    overlay.className = 'timer-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: black; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000;`;
    overlay.innerHTML = `
        <h2 id="overlay-ex-name" style="font-size: 2rem; text-align: center">${exercise.name}</h2>
        <p id="overlay-status" style="font-size: 1.5rem; color: #aaa;">Приготовься</p>
        <h1 id="overlay-timer" style="font-size: 30vw;">5</h1>
        <p id="overlay-sets" style="font-size: 1.5rem;">Подход: 1 / ${currentPhase.sets}</p>
        <button id="stop-workout" style="margin-top: 20px; padding: 10px 20px; background: #444; color: white; border: none;">ПРЕРВАТЬ</button>
    `;
    document.body.appendChild(overlay);

    let currentSet = 1, timeLeft = 5, mode = 'PREP_WORK';
    const timerEl = overlay.querySelector('#overlay-timer'), statusEl = overlay.querySelector('#overlay-status'),
        setsEl = overlay.querySelector('#overlay-sets');

    const interval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 3 && timeLeft > 0) playBeep(2000, 0.1);
        if (timeLeft <= 0) {
            playBeep(2700, 0.3);
            if (mode === 'PREP_WORK') {
                mode = 'WORK';
                timeLeft = currentPhase.work;
                statusEl.textContent = 'РАБОТАЙ!';
                overlay.style.background = '#1a4a1a';
            } else if (mode === 'WORK') {
                mode = 'PREP_REST';
                timeLeft = 5;
                statusEl.textContent = 'ЗАКОНЧИЛ';
                overlay.style.background = 'black';
            } else if (mode === 'PREP_REST') {
                mode = 'REST';
                timeLeft = currentPhase.rest;
                statusEl.textContent = 'ОТДЫХ';
                overlay.style.background = '#4a1a1a';
            } else if (mode === 'REST') {
                if (currentSet < currentPhase.sets) {
                    currentSet++;
                    mode = 'PREP_WORK';
                    timeLeft = 5;
                    statusEl.textContent = 'ПРИГОТОВЬСЯ';
                    setsEl.textContent = `Подход: ${currentSet} / ${currentPhase.sets}`;
                    overlay.style.background = 'black';
                } else {
                    clearInterval(interval);
                    overlay.remove();
                    if (appState.currentExerciseIndex < appState.workoutData.exercises.length - 1) {
                        appState.currentExerciseIndex++;
                        localStorage.setItem('currentExIndex', appState.currentExerciseIndex);
                        renderMainContent();
                    } else {
                        showSuccessModal();
                        appState.currentExerciseIndex = 0;
                        localStorage.setItem('currentExIndex', 0);
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

const showSuccessModal = () => {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1a1a1a; color: white; padding: 30px; border: 2px solid #00ff41; z-index: 2000; text-align: center; width: 90%; max-width: 400px;`;
    const randomQuote = ["Препятствие становится путем. — Марк Аврелий", "Трудности укрепляют разум. — Сенека"][Math.floor(Math.random() * 2)];
    modal.innerHTML = `<h2>ТРЕНИРОВКА ЗАВЕРШЕНА</h2><p style="font-style: italic; margin: 20px 0;">"${randomQuote}"</p><button id="accept-success" style="padding: 10px 20px; background: #00ff41; color: black; border: none; font-weight: bold; cursor: pointer;">ПРИНЯТЬ УСПЕХ</button>`;
    document.body.appendChild(modal);
    document.getElementById('accept-success').onclick = () => {
        modal.remove();
        renderMainContent();
    };
};

window.onload = () => {
    const logs = ["SYSTEM_INITIALIZING...", "STOIC_CORE_LOADED", "UPTIME_MONITOR_ACTIVE", "ACCESS_GRANTED"];
    let i = 0;
    const logContainer = document.getElementById('boot-logs');
    const interval = setInterval(() => {
        const p = document.createElement('p');
        p.textContent = `> ${logs[i]}`;
        logContainer.appendChild(p);
        i++;
        if (i === logs.length) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('boot-screen').style.display = 'none';
                document.getElementById('module-selector').style.display = 'flex';
            }, 800);
        }
    }, 300);
};