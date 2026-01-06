// ============================================
// УТИЛИТЫ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Безопасное получение элемента DOM
 * @param {string} selector - CSS селектор
 * @param {HTMLElement} parent - Родительский элемент (опционально)
 * @returns {HTMLElement|null}
 */
function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Безопасное получение всех элементов DOM
 * @param {string} selector - CSS селектор
 * @param {HTMLElement} parent - Родительский элемент (опционально)
 * @returns {NodeList}
 */
function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * Создание элемента с атрибутами
 * @param {string} tag - HTML тег
 * @param {Object} attributes - Атрибуты элемента
 * @param {string|HTMLElement} content - Контент элемента
 * @returns {HTMLElement}
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        element.appendChild(content);
    }
    
    return element;
}

/**
 * Форматирование даты в читаемый формат
 * @param {Date|string} date - Дата для форматирования
 * @param {string} format - Формат ('full', 'short', 'time')
 * @returns {string}
 */
function formatDate(date, format = 'full') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return 'Некорректная дата';
    }
    
    const options = {
        full: {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        short: {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        },
        time: {
            hour: '2-digit',
            minute: '2-digit'
        }
    };
    
    return d.toLocaleDateString('ru-RU', options[format] || options.full);
}

/**
 * Генератор уникального ID
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Сохранение данных в localStorage с обработкой ошибок
 * @param {string} key - Ключ
 * @param {any} data - Данные
 * @returns {boolean}
 */
function saveToLocalStorage(key, data) {
    try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(key, jsonData);
        return true;
    } catch (error) {
        console.error(`Ошибка сохранения в localStorage (${key}):`, error);
        // Не показываем уведомление пользователю - вызывающий код сам решит, как обработать ошибку
        return false;
    }
}

/**
 * Загрузка данных из localStorage с обработкой ошибок
 * @param {string} key - Ключ
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any}
 */
function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const jsonData = localStorage.getItem(key);
        if (!jsonData) return defaultValue;
        
        return JSON.parse(jsonData);
    } catch (error) {
        console.error(`Ошибка загрузки из localStorage (${key}):`, error);
        // Не показываем уведомление пользователю - возвращаем значение по умолчанию
        return defaultValue;
    }
}

/**
 * Удаление данных из localStorage
 * @param {string} key - Ключ
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Ошибка удаления из localStorage (${key}):`, error);
    }
}

/**
 * Показать уведомление
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип ('success', 'error', 'warning', 'info')
 * @param {number} duration - Длительность в миллисекундах
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Удалить предыдущие уведомления
    $$('.notification').forEach(notification => notification.remove());
    
    const types = {
        success: { icon: '✅', color: '#4CAF50', bg: '#E8F5E9' },
        error: { icon: '❌', color: '#F44336', bg: '#FFEBEE' },
        warning: { icon: '⚠️', color: '#FF9800', bg: '#FFF3E0' },
        info: { icon: 'ℹ️', color: '#2196F3', bg: '#E3F2FD' }
    };
    
    const config = types[type] || types.info;
    
    const notification = createElement('div', {
        className: `notification notification--${type}`,
        style: `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${config.bg};
            color: #333;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 350px;
            animation: slideIn 0.3s ease;
            border-left: 4px solid ${config.color};
        `
    });
    
    notification.innerHTML = `
        <span class="notification__icon" style="font-size: 1.25rem;">${config.icon}</span>
        <span class="notification__message" style="flex: 1;">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.animation = 'notification-slide-out 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    // Ручное закрытие по клику
    notification.addEventListener('click', () => {
        notification.style.animation = 'notification-slide-out 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // CSS стили для notification находятся в css/notification.css
}

/**
 * Проверка поддержки localStorage
 * @returns {boolean}
 */
function isLocalStorageSupported() {
    try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Ограничение частоты вызова функции (throttle)
 * @param {Function} func - Функция
 * @param {number} limit - Лимит в миллисекундах
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Отложенный вызов функции (debounce)
 * @param {Function} func - Функция
 * @param {number} wait - Время ожидания в миллисекундах
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Клонирование объекта
 * @param {Object} obj - Объект для клонирования
 * @returns {Object}
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Валидация email
 * @param {string} email - Email для проверки
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Валидация телефона
 * @param {string} phone - Телефон для проверки
 * @returns {boolean}
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Форматирование номера телефона
 * @param {string} phone - Телефон для форматирования
 * @returns {string}
 */
function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('8')) {
        return `+7 ${cleaned.substring(1, 4)} ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
    }
    
    if (cleaned.length === 10) {
        return `+7 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`;
    }
    
    return phone;
}

/**
 * Копирование текста в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback для старых браузеров
            const textArea = createElement('textarea', {
                style: `
                    position: fixed;
                    top: -1000px;
                    left: -1000px;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: 0;
                    border: 0;
                `
            });
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, 99999);
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    } catch (error) {
        console.error('Ошибка копирования:', error);
        return false;
    }
}

/**
 * Экспорт данных в файл
 * @param {Object|Array} data - Данные для экспорта
 * @param {string} filename - Имя файла
 * @param {string} type - Тип файла ('json', 'csv')
 */
function exportData(data, filename = 'data', type = 'json') {
    try {
        let content, mimeType, extension;
        
        if (type === 'csv') {
            content = convertToCSV(data);
            mimeType = 'text/csv';
            extension = 'csv';
        } else {
            content = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            extension = 'json';
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = createElement('a', {
            href: url,
            download: `${filename}.${extension}`,
            style: 'display: none;'
        });
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showNotification('Данные успешно экспортированы', 'success');
    } catch (error) {
        console.error('Ошибка экспорта данных:', error);
        showNotification('Ошибка экспорта данных', 'error');
    }
}

/**
 * Конвертация данных в CSV
 * @param {Array} data - Массив объектов
 * @returns {string}
 */
function convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return '';
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const cell = row[header];
                const escaped = ('' + cell).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];
    
    return csvRows.join('\n');
}

/**
 * Импорт данных из файла
 * @param {File} file - Файл для импорта
 * @returns {Promise<Object|Array>}
 */
function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                let data;
                
                if (file.type === 'application/json') {
                    data = JSON.parse(content);
                } else if (file.type === 'text/csv') {
                    data = parseCSV(content);
                } else {
                    reject(new Error('Неподдерживаемый формат файла'));
                    return;
                }
                
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Ошибка чтения файла'));
        };
        
        if (file.type === 'application/json') {
            reader.readAsText(file);
        } else if (file.type === 'text/csv') {
            reader.readAsText(file);
        } else {
            reject(new Error('Неподдерживаемый формат файла'));
        }
    });
}

/**
 * Парсинг CSV
 * @param {string} csv - CSV строка
 * @returns {Array}
 */
function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        
        headers.forEach((header, index) => {
            if (values[index]) {
                let value = values[index].replace(/"/g, '').trim();
                
                // Попытка парсинга чисел и булевых значений
                if (!isNaN(value) && value !== '') {
                    value = Number(value);
                } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                    value = value.toLowerCase() === 'true';
                }
                
                obj[header] = value;
            }
        });
        
        return obj;
    }).filter(obj => Object.keys(obj).length > 0);
}

/**
 * Генерация случайного цвета
 * @returns {string}
 */
function getRandomColor() {
    const colors = [
        '#8AA2A9', '#B4A7D6', '#9CAF88', '#FDF6E3',
        '#E8F4F8', '#F5F0FF', '#F0F7EB', '#FFF9E6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Проверка, является ли устройство мобильным
 * @returns {boolean}
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Проверка, является ли устройство планшетом
 * @returns {boolean}
 */
function isTabletDevice() {
    return /iPad|Android(?!.*Mobile)|Tablet|Silk/i.test(navigator.userAgent);
}

/**
 * Получение параметров из URL
 * @param {string} name - Имя параметра
 * @returns {string|null}
 */
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Установка параметров в URL
 * @param {Object} params - Параметры
 */
function setUrlParameters(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });
    window.history.pushState({}, '', url);
}

/**
 * Загрузка JSON файла
 * @param {string} url - URL файла
 * @returns {Promise<Object>}
 */
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки JSON:', error);
        // Не показываем уведомление пользователю - вызывающий код сам решит, как обработать ошибку
        throw error;
    }
}

/**
 * Загрузка изображения
 * @param {string} src - URL изображения
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Предотвращение стандартного поведения события
 * @param {Event} event - Событие
 */
function preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
}

/**
 * Показ спиннера загрузки
 * @param {boolean} show - Показать/скрыть
 * @param {string} message - Сообщение
 */
function showLoading(show = true, message = 'Загрузка...') {
    let spinner = $('#loading-spinner');
    
    if (show) {
        if (!spinner) {
            spinner = createElement('div', {
                id: 'loading-spinner',
                style: `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9998;
                    gap: 1rem;
                `
            });
            
            spinner.innerHTML = `
                <div class="spinner" style="
                    width: 50px;
                    height: 50px;
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #8AA2A9;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <p style="color: #333; font-size: 1rem;">${message}</p>
            `;
            
            // Добавить CSS анимацию
            if (!$('#spinner-styles')) {
                const style = createElement('style', {
                    id: 'spinner-styles'
                }, `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `);
                document.head.appendChild(style);
            }
            
            document.body.appendChild(spinner);
        }
    } else if (spinner) {
        spinner.remove();
    }
}

// Экспорт функций
window.utils = {
    $, $$, createElement, formatDate, generateId,
    saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage,
    showNotification, isLocalStorageSupported, throttle, debounce,
    deepClone, isValidEmail, isValidPhone, formatPhone,
    copyToClipboard, exportData, importData, getRandomColor,
    isMobileDevice, isTabletDevice, getUrlParameter, setUrlParameters,
    loadJSON, loadImage, preventDefault, showLoading
};