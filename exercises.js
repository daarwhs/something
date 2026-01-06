// exercises.js — УПРАЖНЕНИЯ С МОДАЛЬНЫМИ ОКНАМИ И ТАЙМЕРАМИ

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('exercisesGrid');

    const exercises = [
        {
            id: "breathing-478",
            title: "Дыхание 4-7-8",
            description: "Мощная техника для быстрого снятия тревоги",
            duration: 4,
            steps: [
                { action: "Вдох", duration: 4, color: "#9CAF88", sound: "in" },
                { action: "Задержка", duration: 7, color: "#B4A7D6", sound: "hold" },
                { action: "Выдох", duration: 8, color: "#8AA2A9", sound: "out" }
            ],
            instruction: "Вдох через нос на 4 секунды → Задержка дыхания на 7 секунд → Медленный выдох через рот на 8 секунд"
        },
        {
            id: "square-breathing",
            title: "Квадратное дыхание",
            description: "Помогает успокоиться и сосредоточиться",
            duration: 4,
            steps: [
                { action: "Вдох", duration: 4, color: "#9CAF88", sound: "in" },
                { action: "Задержка", duration: 4, color: "#B4A7D6", sound: "hold" },
                { action: "Выдох", duration: 4, color: "#8AA2A9", sound: "out" },
                { action: "Задержка", duration: 4, color: "#B4A7D6", sound: "hold" }
            ],
            instruction: "Дышите по квадрату: вдох → задержка → выдох → задержка. По 4 секунды на каждую фазу."
        },
        {
            id: "grounding-54321",
            title: "Техника заземления 5-4-3-2-1",
            description: "Быстро возвращает в «здесь и сейчас» при панике",
            duration: 30,
            steps: [
                { action: "5 вещей, которые вы видите", duration: 30, color: "#9CAF88", sound: "step" },
                { action: "4 вещи, которые можете потрогать", duration: 24, color: "#B4A7D6", sound: "step" },
                { action: "3 звука, которые слышите", duration: 18, color: "#8AA2A9", sound: "step" },
                { action: "2 запаха", duration: 12, color: "#9CAF88", sound: "step" },
                { action: "1 вкус", duration: 6, color: "#B4A7D6", sound: "complete" }
            ],
            instruction: "Назови по очереди: 5 вещей, которые видишь → 4, которые можешь потрогать → 3 звука → 2 запаха → 1 вкус"
        }
    ];

    // Создаём модальное окно для упражнений, если его ещё нет
    if (!document.getElementById('exerciseModal')) {
        const modalHTML = `
            <div class="modal modal--exercise" id="exerciseModal" role="dialog" aria-labelledby="exerciseModalTitle" aria-modal="true" hidden>
                <div class="modal__overlay" data-modal-close></div>
                <div class="modal__container">
                    <div class="modal__header">
                        <h2 class="modal__title" id="exerciseModalTitle">Упражнение</h2>
                        <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
                    </div>
                    <div class="modal__body" id="exerciseModalBody">
                        <!-- Контент упражнения будет вставлен сюда -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Добавляем обработчики закрытия модального окна
        const modal = document.getElementById('exerciseModal');
        modal.querySelectorAll('[data-modal-close]').forEach(element => {
            element.addEventListener('click', function(e) {
                if (e.target === this || this.classList.contains('modal__close')) {
                    closeExerciseModal();
                }
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('exerciseModal');
                if (modal && !modal.hidden) {
                    closeExerciseModal();
                }
            }
        });
    }

    // Переменные для управления таймером
    let currentTimerInterval = null;
    let isTimerPaused = false;
    let pausedTimeLeft = 0;
    let pausedStepIndex = 0;
    let currentExercise = null;

    // Функция открытия модального окна с упражнением
    function openExerciseModal(exercise) {
        const modal = document.getElementById('exerciseModal');
        const title = document.getElementById('exerciseModalTitle');
        const body = document.getElementById('exerciseModalBody');
        
        title.textContent = exercise.title;
        body.innerHTML = `
            <div class="exercise-modal">
                <p class="exercise-modal__description">${exercise.description}</p>
                <p class="exercise-modal__instruction">${exercise.instruction}</p>
                
                <div class="exercise-modal__timer">
                    <div class="exercise-card__timer-circle">
                        <svg viewBox="0 0 100 100" class="exercise-card__timer-svg">
                            <circle cx="50" cy="50" r="45" class="exercise-card__timer-bg"/>
                            <circle cx="50" cy="50" r="45" class="exercise-card__timer-progress" id="modal-progress"/>
                        </svg>
                        <div class="exercise-card__timer-display">
                            <div class="exercise-card__timer-phase" id="modal-phase">Готовы?</div>
                            <div class="exercise-card__timer-seconds" id="modal-seconds">0</div>
                        </div>
                    </div>
                </div>
                
                <div class="exercise-modal__actions">
                    <button class="exercise-card__button" id="startExerciseBtn">Начать упражнение</button>
                    <button class="exercise-card__button exercise-card__button--pause" id="pauseExerciseBtn" style="display: none;">Пауза</button>
                    <button class="exercise-card__button exercise-card__button--restart" id="restartExerciseBtn" style="display: none;">Перезапустить</button>
                    <button class="exercise-card__timer-stop" id="stopExerciseBtn" style="display: none;">Стоп</button>
                </div>
            </div>
        `;
        
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Привязываем кнопки управления
        const startBtn = document.getElementById('startExerciseBtn');
        const pauseBtn = document.getElementById('pauseExerciseBtn');
        const restartBtn = document.getElementById('restartExerciseBtn');
        const stopBtn = document.getElementById('stopExerciseBtn');

        startBtn.addEventListener('click', () => {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'block';
            stopBtn.style.display = 'block';
            currentExercise = exercise;
            startModalExercise(exercise);
        });

        pauseBtn.addEventListener('click', () => {
            if (isTimerPaused) {
                // Продолжить
                pauseBtn.textContent = 'Пауза';
                pauseBtn.classList.remove('exercise-card__button--resume');
                startModalExercise(currentExercise, true);
            } else {
                // Пауза
                pauseBtn.textContent = 'Продолжить';
                pauseBtn.classList.add('exercise-card__button--resume');
                pauseModalExercise();
            }
            isTimerPaused = !isTimerPaused;
        });

        restartBtn.addEventListener('click', () => {
            if (currentTimerInterval) {
                clearInterval(currentTimerInterval);
                currentTimerInterval = null;
            }
            // Сброс состояния
            isTimerPaused = false;
            pausedTimeLeft = 0;
            pausedStepIndex = 0;

            // Скрыть кнопки паузы и перезапуска, показать старт
            pauseBtn.style.display = 'none';
            restartBtn.style.display = 'none';
            stopBtn.style.display = 'none';
            startBtn.style.display = 'block';
            startBtn.textContent = 'Начать упражнение';

            // Сброс дисплея таймера
            const phaseEl = document.getElementById('modal-phase');
            const secondsEl = document.getElementById('modal-seconds');
            const progress = document.getElementById('modal-progress');

            phaseEl.textContent = 'Готовы?';
            phaseEl.style.color = '';
            secondsEl.textContent = '0';
            progress.style.strokeDashoffset = progress.style.strokeDasharray;
            progress.style.stroke = '';
        });

        stopBtn.addEventListener('click', () => {
            if (currentTimerInterval) {
                clearInterval(currentTimerInterval);
                currentTimerInterval = null;
            }
            // Сброс состояния
            isTimerPaused = false;
            pausedTimeLeft = 0;
            pausedStepIndex = 0;
            currentExercise = null;
            closeExerciseModal();
        });
    }
    
    // Функция паузы упражнения
    function pauseModalExercise() {
        if (currentTimerInterval) {
            clearInterval(currentTimerInterval);
            currentTimerInterval = null;
        }
    }

    // Функция закрытия модального окна
    function closeExerciseModal() {
        if (currentTimerInterval) {
            clearInterval(currentTimerInterval);
            currentTimerInterval = null;
        }
        // Сброс состояния
        isTimerPaused = false;
        pausedTimeLeft = 0;
        pausedStepIndex = 0;
        currentExercise = null;

        const modal = document.getElementById('exerciseModal');
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    // Отображаем карточки упражнений
    grid.innerHTML = exercises.map(ex => {
        const images = {
            "breathing-478": "../assets/images/упражнение 1.jpg",
            "square-breathing": "../assets/images/упражнение 2.jpg",
            "grounding-54321": "../assets/images/упражнение 3.jpg"
        };
        const hasImage = images[ex.id];
        return `
        <div class="exercise-card" data-id="${ex.id}">
            <div class="exercise-card__image-wrapper ${hasImage ? 'exercise-card__image-wrapper--has-image' : ''}">
                ${hasImage 
                    ? `<img src="${images[ex.id]}" alt="${ex.title}" loading="lazy" class="exercise-card__image" onerror="this.parentElement.classList.remove('exercise-card__image-wrapper--has-image'); this.remove();">`
                    : ''
                }
            </div>
            <h3 class="exercise-card__title">${ex.title}</h3>
            <p class="exercise-card__description">${ex.description}</p>
            <button class="exercise-card__button" data-exercise-id="${ex.id}">Начать упражнение</button>
        </div>
    `;
    }).join('');

    // Обработчики кнопок - открытие модального окна
    document.querySelectorAll('.exercise-card__button').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.exerciseId;
            const exercise = exercises.find(e => e.id === id);
            if (exercise) {
                openExerciseModal(exercise);
            }
        });
    });

    // Функция запуска упражнения в модальном окне
    function startModalExercise(exercise, resume = false) {
        let stepIndex = resume ? pausedStepIndex : 0;
        let timeLeft = resume ? pausedTimeLeft : exercise.steps[stepIndex].duration;
        const progress = document.getElementById('modal-progress');
        const phaseEl = document.getElementById('modal-phase');
        const secondsEl = document.getElementById('modal-seconds');
        const stopBtn = document.getElementById('stopExerciseBtn');
        const startBtn = document.getElementById('startExerciseBtn');
        const pauseBtn = document.getElementById('pauseExerciseBtn');
        const restartBtn = document.getElementById('restartExerciseBtn');

        const totalDuration = exercise.steps.reduce((a, b) => a + b.duration, 0);
        let elapsed = resume ? (totalDuration - exercise.steps.slice(stepIndex + 1).reduce((a, b) => a + b.duration, 0) - (exercise.steps[stepIndex].duration - timeLeft)) : 0;

        // Инициализация SVG круга
        const circumference = 2 * Math.PI * 45;
        progress.style.strokeDasharray = circumference;

        if (!resume) {
            progress.style.strokeDashoffset = circumference;
        }

        progress.style.stroke = exercise.steps[stepIndex].color || '#9CAF88';
        progress.style.transition = 'stroke-dashoffset 0.3s ease, stroke 0.3s ease';

        // Обновление фазы
        const updatePhase = () => {
            const step = exercise.steps[stepIndex];
            phaseEl.textContent = step.action;
            phaseEl.style.color = step.color || '#9CAF88';
            progress.style.stroke = step.color || '#9CAF88';
            
            if (step.sound) {
                playSound(step.sound);
            }
        };

        updatePhase();

        currentTimerInterval = setInterval(() => {
            elapsed++;
            const percent = (elapsed / totalDuration) * 100;
            const offset = circumference - (circumference * percent / 100);
            progress.style.strokeDashoffset = offset;

            secondsEl.textContent = timeLeft;

            if (timeLeft === 1 && stepIndex < exercise.steps.length - 1) {
                playSound('tick');
            }

            if (--timeLeft < 0) {
                stepIndex++;
                if (stepIndex >= exercise.steps.length) {
                    clearInterval(currentTimerInterval);
                    currentTimerInterval = null;

                    // Показать кнопку перезапуска
                    pauseBtn.style.display = 'none';
                    restartBtn.style.display = 'block';
                    stopBtn.textContent = "Закрыть";

                    phaseEl.textContent = "Готово! Вы молодец ✨";
                    secondsEl.textContent = "0";
                    progress.style.strokeDashoffset = 0;

                    playSound('complete');
                    return;
                }
                timeLeft = exercise.steps[stepIndex].duration;
                updatePhase();
            }

            // Сохраняем текущее состояние для возможности паузы
            pausedTimeLeft = timeLeft;
            pausedStepIndex = stepIndex;
        }, 1000);
    }
});

// Функция для воспроизведения звукового сигнала
function playSound(type = 'tick') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'in':
                oscillator.frequency.value = 400;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'out':
                oscillator.frequency.value = 300;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
            case 'hold':
                oscillator.frequency.value = 350;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'step':
                oscillator.frequency.value = 500;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'complete':
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.value = freq;
                    osc.type = 'sine';
                    gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5 + i * 0.1);
                    osc.start(audioContext.currentTime + i * 0.1);
                    osc.stop(audioContext.currentTime + 0.5 + i * 0.1);
                });
                break;
            default:
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
        }
    } catch (error) {
        console.log('Звук недоступен:', error);
    }
}
