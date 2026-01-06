// mood-tracker.js — ГРАФИК + КРАСИВЫЕ КНОПКИ + ВСЁ РАБОТАЕТ

let moodChart = null;
let chartCanvas = null;

document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-scale__button');
    const notesInput = document.getElementById('moodNotes');
    const saveBtn = document.getElementById('saveMood');
    const historyList = document.getElementById('moodHistoryList');
    chartCanvas = document.getElementById('moodChart');

    let selectedMood = null;

    // Выбор настроения
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('mood-scale__button--selected'));
            btn.classList.add('mood-scale__button--selected');
            selectedMood = parseInt(btn.dataset.mood);
        });
    });

    // Сохранение записи
    saveBtn.addEventListener('click', () => {
        if (!selectedMood) {
            alert('Выберите ваше настроение!');
            return;
        }

        // Добавляем анимацию сохранения
        const notesWrapper = notesInput.closest('.mood-form__notes');
        if (notesWrapper) {
            notesWrapper.classList.add('saving');
            setTimeout(() => {
                notesWrapper.classList.remove('saving');
                notesWrapper.classList.add('saved');
                setTimeout(() => {
                    notesWrapper.classList.remove('saved');
                }, 1000);
            }, 500);
        }

        const entry = {
            date: new Date().toISOString().split('T')[0],
            mood: selectedMood,
            notes: notesInput.value.trim(),
            timestamp: Date.now()
        };

        const saved = saveEntry(entry);
        notesInput.value = '';
        selectedMood = null;
        moodButtons.forEach(b => b.classList.remove('mood-scale__button--selected'));

        // Немедленно обновляем историю и график
        renderHistory();
        
        // Небольшая задержка перед обновлением графика для плавности
        requestAnimationFrame(() => {
            updateChart();
        });
        
        // Показываем уведомление об успешном сохранении
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification(saved ? 'Запись сохранена! ✨' : 'Запись добавлена (локально)', saved ? 'success' : 'warning');
        }
    });

    // Улучшенные функции работы с localStorage (совместимость с мобильными)
    function getEntries() {
        try {
            const data = localStorage.getItem('moodEntries');
            if (!data) return [];
            const entries = JSON.parse(data);
            // Проверяем валидность данных
            if (!Array.isArray(entries)) return [];
            return entries.filter(e => e && e.mood && e.timestamp);
        } catch (error) {
            console.warn('Ошибка чтения данных из localStorage:', error);
            return [];
        }
    }

    function saveEntry(entry) {
        try {
            const entries = getEntries();
            entries.push(entry);
            localStorage.setItem('moodEntries', JSON.stringify(entries));
            // Принудительная синхронизация для мобильных браузеров
            forceStorageSync();
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
            // Пробуем альтернативный метод для Safari в приватном режиме
            try {
                sessionStorage.setItem('moodEntries_backup', JSON.stringify(getEntries().concat([entry])));
            } catch (e) {
                console.warn('Не удалось сохранить даже в sessionStorage');
            }
            return false;
        }
    }
    
    // Принудительная синхронизация localStorage для мобильных браузеров
    function forceStorageSync() {
        try {
            // Чтение и запись пустого значения вызывает синхронизацию в некоторых браузерах
            const temp = localStorage.getItem('_sync');
            localStorage.setItem('_sync', Date.now().toString());
            localStorage.removeItem('_sync');
        } catch (e) {
            // Игнорируем ошибки синхронизации
        }
    }

    // Рендер истории
    function renderHistory() {
        const entries = getEntries().reverse();
        historyList.innerHTML = entries.length === 0 
            ? '<p style="text-align:center; color:#888;">Пока нет записей</p>'
            : '';

        entries.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'mood-history__item';
            div.innerHTML = `
                <div class="mood-history__item-header">
                    <div class="mood-history__item-date">
                        <strong>${formatDate(entry.date)}</strong>
                    </div>
                    <div class="mood-history__item-mood">
                        <span class="mood-emoji">${getMoodEmoji(entry.mood)}</span>
                        <span class="mood-score">${entry.mood}/10</span>
                    </div>
                </div>
                ${entry.notes ? `<div class="mood-history__item-notes">${entry.notes}</div>` : ''}
                <div class="mood-actions">
                    <button onclick="deleteEntry(${entry.timestamp})" class="btn-delete">Удалить</button>
                </div>
            `;
            historyList.appendChild(div);
        });
    }

    // Форматирование даты
    function formatDate(dateStr) {
        const options = { day: 'numeric', month: 'short' };
        return new Date(dateStr).toLocaleDateString('ru-RU', options);
    }

    function getMoodEmoji(mood) {
        const emojis = ['😔','🙁','😐','😌','🙂','😊','😄','😁','🥳','🌟'];
        return emojis[mood - 1];
    }

    // Удаление записи
    window.deleteEntry = (timestamp) => {
        if (confirm('Удалить эту запись?')) {
            let entries = getEntries();
            entries = entries.filter(e => e.timestamp !== timestamp);
            localStorage.setItem('moodEntries', JSON.stringify(entries));
            renderHistory();
            updateChart();
        }
    };

    // ГРАФИК — КРАСИВЫЙ И РАБОЧИЙ
    function updateChart() {
        const entries = getEntries();
        
        // Находим контейнер графика
        const chartContainer = chartCanvas ? chartCanvas.parentElement : document.querySelector('.mood-chart');
        
        if (entries.length === 0) {
            if (chartContainer) {
                chartContainer.innerHTML = '<canvas id="moodChart"></canvas><p style="text-align:center; color:#888; padding:3rem;">Нет данных для графика. Добавьте первую запись!</p>';
                chartCanvas = document.getElementById('moodChart');
            }
            return;
        }

        // Восстанавливаем canvas если его нет
        if (!chartCanvas || !document.body.contains(chartCanvas)) {
            if (chartContainer) {
                chartContainer.innerHTML = '<canvas id="moodChart"></canvas>';
                chartCanvas = document.getElementById('moodChart');
            }
        }
        
        if (!chartCanvas) {
            console.warn('Canvas для графика не найден');
            return;
        }

        // Берём последние 30 дней
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const recent = entries
            .filter(e => e.timestamp >= thirtyDaysAgo)
            .sort((a, b) => a.timestamp - b.timestamp);

        const labels = recent.map(e => formatDate(e.date));
        const data = recent.map(e => e.mood);

        // Уничтожаем старый график
        if (moodChart) {
            moodChart.destroy();
            moodChart = null;
        }

        // Создаём новый график
        try {
            moodChart = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: labels.length ? labels : ['Нет данных'],
                    datasets: [{
                        label: 'Настроение',
                        data: data.length ? data : [0],
                        borderColor: '#9CAF88',
                        backgroundColor: 'rgba(156, 175, 136, 0.1)',
                        borderWidth: 4,
                        pointBackgroundColor: '#9CAF88',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: {
                        duration: 500 // Быстрая анимация для моментального обновления
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => `Настроение: ${ctx.raw}/10 ${getMoodEmoji(ctx.raw)}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            min: 1,
                            max: 10,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
            console.log('График успешно обновлён');
        } catch (error) {
            console.error('Ошибка создания графика:', error);
        }
    }

    // Экспорт данных в CSV
    window.exportMoodData = () => {
        const entries = getEntries();
        
        if (entries.length === 0) {
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification('Нет данных для экспорта', 'warning');
            } else {
                alert('Нет данных для экспорта');
            }
            return;
        }

        // Формируем данные для CSV
        const exportData = entries.map(entry => ({
            'Дата': formatDate(entry.date),
            'Настроение': `${entry.mood}/10`,
            'Эмодзи': getMoodEmoji(entry.mood),
            'Заметки': entry.notes || '',
            'Временная метка': new Date(entry.timestamp).toLocaleString('ru-RU')
        }));

        // Используем функцию экспорта из utils, если доступна
        if (window.utils && typeof window.utils.exportData === 'function') {
            window.utils.exportData(exportData, 'mindcare_дневник_настроения', 'csv');
        } else {
            // Простая реализация экспорта CSV
            const headers = Object.keys(exportData[0]);
            const csvRows = [
                headers.join(','),
                ...exportData.map(row => 
                    headers.map(header => {
                        const value = row[header] || '';
                        // Экранируем кавычки и запятые
                        return `"${String(value).replace(/"/g, '""')}"`;
                    }).join(',')
                )
            ];
            
            const csvContent = csvRows.join('\n');
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'mindcare_дневник_настроения.csv';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification('Данные успешно экспортированы! 📥', 'success');
        } else {
            alert('Данные успешно экспортированы!');
        }
    };

    // Запуск
    renderHistory();
    updateChart();
});