// ============================================
// ГЛАВНЫЙ ФАЙЛ САЙТА - ИНИЦИАЛИЗАЦИЯ И ОСНОВНАЯ ЛОГИКА
// ============================================

// Импорт утилит
import './utils.js';

class MentalHealthApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        this.init();
    }

    /**
     * Инициализация приложения
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Проверка поддержки localStorage
            if (!utils.isLocalStorageSupported()) {
                this.showLocalStorageWarning();
            }

            // Инициализация основных компонентов - ПЕРВОЙ инициализируем кнопку выхода
            // Используем try-catch для каждого компонента, чтобы ошибка в одном не ломала остальные
            try {
                this.initEmergencyExit();
            } catch (error) {
                console.warn('Ошибка инициализации кнопки выхода:', error);
            }

            try {
                this.initNavigation();
            } catch (error) {
                console.warn('Ошибка инициализации навигации:', error);
            }

            try {
                this.initScrollToTop();
            } catch (error) {
                console.warn('Ошибка инициализации прокрутки:', error);
            }

            try {
                this.initEmergencyModal();
            } catch (error) {
                console.warn('Ошибка инициализации модального окна:', error);
            }

            try {
                this.initAccessibility();
            } catch (error) {
                console.warn('Ошибка инициализации доступности:', error);
            }

            try {
                this.initAnalytics();
            } catch (error) {
                console.warn('Ошибка инициализации аналитики:', error);
            }
            
            // Загрузка данных для текущей страницы (не критично, если не загрузится)
            try {
                await this.loadPageSpecificData();
            } catch (error) {
                console.warn('Ошибка загрузки данных страницы:', error);
                // Не показываем уведомление пользователю, так как это не критично
            }
            
            // Инициализация завершена
            this.isInitialized = true;
            
            // Показать приветственное сообщение для новых пользователей
            try {
                setTimeout(() => this.showWelcomeMessage(), 1000);
            } catch (error) {
                console.warn('Ошибка показа приветственного сообщения:', error);
            }
            
            console.log('Приложение успешно инициализировано');
            
        } catch (error) {
            // Критическая ошибка, которая не была обработана выше
            console.error('Критическая ошибка инициализации приложения:', error);
            // Не показываем уведомление пользователю - приложение может работать частично
            // Уведомление будет показано только для критических проблем (например, localStorage)
        }
    }

    /**
     * Инициализация кнопки экстренного выхода - УПРОЩЕННАЯ ВЕРСИЯ
     */
    initEmergencyExit() {
        console.log('Инициализация кнопки быстрого выхода...');
        
        // Вариант 1: Ищем по ID
        let emergencyExitBtn = document.getElementById('emergencyExit');
        
        // Вариант 2: Ищем по классу, если нет по ID
        if (!emergencyExitBtn) {
            emergencyExitBtn = document.querySelector('.emergency-exit-btn');
        }
        
        // Вариант 3: Ищем по атрибуту data-role
        if (!emergencyExitBtn) {
            emergencyExitBtn = document.querySelector('[data-role="emergency-exit"]');
        }
        
        // Вариант 4: Ищем любую кнопку с текстом "Выход" или "Exit"
        if (!emergencyExitBtn) {
            const allButtons = document.querySelectorAll('button, a');
            emergencyExitBtn = Array.from(allButtons).find(btn => 
                btn.textContent.includes('Выход') || 
                btn.textContent.includes('выход') ||
                btn.textContent.includes('Exit') ||
                btn.textContent.includes('exit') ||
                (btn.innerHTML && btn.innerHTML.includes('🏃'))
            );
        }
        
        if (emergencyExitBtn) {
            console.log('Кнопка найдена:', emergencyExitBtn);
            
            // Удаляем все старые обработчики
            const newBtn = emergencyExitBtn.cloneNode(true);
            emergencyExitBtn.parentNode.replaceChild(newBtn, emergencyExitBtn);
            emergencyExitBtn = newBtn;
            
            // Простой обработчик клика
            emergencyExitBtn.onclick = (e) => {
                console.log('КЛИК ПО КНОПКЕ БЫСТРОГО ВЫХОДА!');
                e.preventDefault();
                e.stopImmediatePropagation();
                
                // Немедленный выход без подтверждения
                this.performEmergencyExit();
                return false;
            };
            
            // Обработчик для клавиатуры
            emergencyExitBtn.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this.performEmergencyExit();
                }
            };
            
            // Добавляем стили для визуального выделения
            emergencyExitBtn.style.cursor = 'pointer';
            emergencyExitBtn.style.transition = 'all 0.3s';
            
            emergencyExitBtn.addEventListener('mouseover', () => {
                emergencyExitBtn.style.transform = 'scale(1.05)';
            });
            
            emergencyExitBtn.addEventListener('mouseout', () => {
                emergencyExitBtn.style.transform = 'scale(1)';
            });
            
        } else {
            console.warn('Кнопка быстрого выхода не найдена на странице. Создаем свою...');
            this.createEmergencyExitButton();
        }
    }
    
    /**
     * Создание кнопки быстрого выхода, если она не найдена
     */
    createEmergencyExitButton() {
        const button = document.createElement('button');
        button.id = 'emergencyExit';
        button.innerHTML = '🏃 Быстрый выход';
        button.title = 'Быстро покинуть сайт';
        button.setAttribute('aria-label', 'Быстрый выход с сайта');
        
        // Стили для кнопки
        button.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: #e74c3c;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s;
        `;
        
        button.onclick = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('КЛИК ПО СОЗДАННОЙ КНОПКЕ ВЫХОДА!');
            this.performEmergencyExit();
            return false;
        };
        
        document.body.appendChild(button);
        console.log('Создана новая кнопка быстрого выхода');
    }

    /**
     * ВЫПОЛНЕНИЕ ЭКСТРЕННОГО ВЫХОДА - УПРОЩЕННАЯ ВЕРСИЯ
     */
    performEmergencyExit() {
        console.log('=== ЗАПУСК БЫСТРОГО ВЫХОДА ===');
        
        // 1. Открываем Google в новой вкладке сразу
        window.open('https://www.google.com', '_blank');
        
        // 2. Быстро заменяем содержимое страницы
        try {
            // Сохраняем ссылку на оригинальный body
            const originalBody = document.body.cloneNode(true);
            
            // Очищаем страницу
            document.documentElement.innerHTML = '';
            
            // Создаем новый простой HTML
            const safeHTML = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Безопасный выход</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: #FDF6E3;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .safety-container {
            max-width: 600px;
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 {
            color: #e74c3c;
            margin-bottom: 20px;
            font-size: 28px;
        }
        p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
            font-size: 16px;
        }
        .safety-screen {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
        }
        .safety-screen__icon {
            font-size: 50px;
            margin-bottom: 20px;
        }
        .safety-screen__title {
            color: #e74c3c;
            margin-bottom: 20px;
            font-size: 28px;
        }
        .safety-screen__text {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
            font-size: 16px;
        }
        .safety-screen__actions {
            margin-top: 30px;
        }
        .safety-screen__button {
            display: inline-block;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            margin: 10px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        .safety-screen__button--primary {
            background: #2ecc71;
        }
        .safety-screen__button--primary:hover {
            background: #27ae60;
            transform: translateY(-2px);
        }
        .safety-screen__button--secondary {
            background: #3498db;
        }
        .safety-screen__button--secondary:hover {
            background: #2980b9;
        }
        .safety-screen__button--return {
            background: #95a5a6;
        }
        .safety-screen__button--return:hover {
            background: #7f8c8d;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="safety-screen">
        <div class="safety-screen__icon">🛡️</div>
        <h1 class="safety-screen__title">Вы безопасно покинули сайт</h1>
        <p class="safety-screen__text">Эта страница была заменена на безопасный экран. Браузер автоматически открыл новую вкладку с нейтральным контентом.</p>
        <p class="safety-screen__text">Если вам нужна помощь, пожалуйста, обратитесь к специалисту или позвоните по телефону доверия.</p>
        
        <div class="safety-screen__actions">
            <a href="https://www.google.com" target="_blank" class="safety-screen__button safety-screen__button--primary">
                Перейти на Google
            </a>
            <a href="https://www.youtube.com" target="_blank" class="safety-screen__button safety-screen__button--secondary">
                Перейти на YouTube
            </a>
            <button onclick="location.reload()" class="safety-screen__button safety-screen__button--return">
                Вернуться на сайт
            </button>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #999;">
                <strong>Экстренные телефоны:</strong><br>
                112 - Единый номер экстренных служб<br>
                8-800-2000-122 - Телефон доверия для детей и подростков
            </p>
        </div>
    </div>
    
    <script>
        // Блокируем кнопки браузера
        history.pushState(null, null, window.location.href);
        window.onpopstate = function() {
            history.pushState(null, null, window.location.href);
        };
        
        // Открываем еще одну безопасную ссылку через 2 секунды
        setTimeout(() => {
            window.open('https://ru.wikipedia.org', '_blank');
        }, 2000);
        
        // Фокус на кнопке возврата
        document.querySelector('button').focus();
    </script>
</body>
</html>`;
            
            // Записываем новый HTML
            document.open();
            document.write(safeHTML);
            document.close();
            
        } catch (error) {
            console.error('Ошибка при выходе:', error);
            // Если что-то пошло не так, просто перенаправляем
            window.location.href = 'https://www.google.com';
        }
        
        // Отслеживаем использование
        this.trackEmergencyExit();
    }

    /**
     * Отслеживание использования экстренного выхода
     */
    trackEmergencyExit() {
        try {
            const exits = JSON.parse(localStorage.getItem('emergency_exits') || '[]');
            exits.push({
                timestamp: new Date().toISOString(),
                page: this.currentPage,
                time: new Date().toLocaleTimeString()
            });
            localStorage.setItem('emergency_exits', JSON.stringify(exits.slice(-20)));
        } catch (error) {
            console.warn('Не удалось сохранить статистику');
        }
    }

    // ============================================
    // ОСТАЛЬНЫЕ МЕТОДЫ БЕЗ ИЗМЕНЕНИЙ
    // ============================================

    /**
     * Инициализация навигации
     */
    initNavigation() {
        // Мобильное меню
        const menuToggle = $('#menuToggle');
        const nav = $('.header__nav');
        
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', () => {
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
                menuToggle.setAttribute('aria-expanded', !isExpanded);
                nav.setAttribute('aria-expanded', !isExpanded);
                
                // Блокировка скролла при открытом меню
                document.body.style.overflow = isExpanded ? '' : 'hidden';
            });
            
            // Закрытие меню при клике на ссылку
            $$('.header__nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    nav.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });
            
            // Закрытие меню при клике вне его
            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    nav.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Подсветка активной страницы
        this.highlightActivePage();
        
        // Плавная прокрутка для якорных ссылок
        this.initSmoothScroll();
    }

    /**
     * Подсветка активной страницы в навигации
     */
    highlightActivePage() {
        const currentPath = window.location.pathname;
        $$('.header__nav-link').forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.includes(linkPath) && linkPath !== 'index.html') {
                link.classList.add('header__nav-link--active');
            } else if (currentPath.endsWith('/') && linkPath === 'index.html') {
                link.classList.add('header__nav-link--active');
            }
        });
    }

    /**
     * Инициализация плавной прокрутки
     */
    initSmoothScroll() {
        $$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                
                if (href === '#') return;
                
                const target = $(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Обновить URL без перезагрузки
                    history.pushState(null, null, href);
                }
            });
        });
    }

    /**
     * Инициализация кнопки "Наверх"
     */
    initScrollToTop() {
        const scrollTopBtn = $('#scrollTop');
        
        if (scrollTopBtn) {
            // Показать/скрыть кнопку при скролле
            window.addEventListener('scroll', utils.throttle(() => {
                if (window.pageYOffset > 300) {
                    scrollTopBtn.classList.add('scroll-top--visible');
                } else {
                    scrollTopBtn.classList.remove('scroll-top--visible');
                }
            }, 100));
            
            // Обработка клика
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        
        // Также инициализируем старую кнопку для совместимости
        const scrollTopBtnOld = $('#scrollTopBtn');
        if (scrollTopBtnOld) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 400) {
                    scrollTopBtnOld.classList.add('visible');
                } else {
                    scrollTopBtnOld.classList.remove('visible');
                }
            });
            
            scrollTopBtnOld.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Инициализация модального окна экстренной помощи
     */
    initEmergencyModal() {
        const emergencyModal = $('#emergencyModal');
        const closeModalBtn = $('#closeEmergencyModal');
        
        if (emergencyModal && closeModalBtn) {
            // Кнопка открытия (если есть на странице)
            const emergencyBtn = $('#emergencyHelpBtn');
            if (emergencyBtn) {
                emergencyBtn.addEventListener('click', () => {
                    this.openEmergencyModal();
                });
            }
            
            // Закрытие по кнопке
            closeModalBtn.addEventListener('click', () => {
                this.closeModal(emergencyModal);
            });
            
            // Закрытие по клику вне модального окна
            emergencyModal.addEventListener('click', (e) => {
                if (e.target === emergencyModal) {
                    this.closeModal(emergencyModal);
                }
            });
            
            // Закрытие по Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && emergencyModal.style.display === 'flex') {
                    this.closeModal(emergencyModal);
                }
            });
            
            // Загрузка контактов для модального окна
            this.loadEmergencyContacts();
        }
    }

    /**
     * Открытие модального окна экстренной помощи
     */
    openEmergencyModal() {
        const modal = $('#emergencyModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Фокус на первой кнопке закрытия
            const closeBtn = $('#closeEmergencyModal');
            if (closeBtn) {
                setTimeout(() => closeBtn.focus(), 100);
            }
        }
    }

    /**
     * Закрытие модального окна
     */
    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    /**
     * Загрузка контактов экстренной помощи
     */
    async loadEmergencyContacts() {
        try {
            // Определяем правильный путь в зависимости от расположения страницы
            const isInPagesDir = window.location.pathname.includes('/pages/');
            const contactsPath = isInPagesDir ? '../data/contacts-data.js' : 'data/contacts-data.js';
            
            // Пробуем загрузить JSON, если не получается - используем встроенные данные
            let contacts;
            try {
                const jsonPath = isInPagesDir ? '../data/contacts.json' : 'data/contacts.json';
                contacts = await utils.loadJSON(jsonPath);
            } catch (jsonError) {
                // Если JSON не найден, используем встроенные данные из contacts-data.js
                if (window.CONTACTS_DATA && window.CONTACTS_DATA.contacts) {
                    contacts = window.CONTACTS_DATA;
                } else {
                    throw new Error('Не удалось загрузить данные контактов');
                }
            }
            
            const emergencyContacts = contacts.contacts.filter(c => c.type === 'crisis');
            
            const container = $('#emergencyContactsList');
            if (container && emergencyContacts.length > 0) {
                container.innerHTML = emergencyContacts.map(contact => `
                    <div class="emergency-contact">
                        <h4>${contact.name}</h4>
                        ${contact.phone ? `<p>📞 <a href="tel:${contact.phone}">${utils.formatPhone(contact.phone)}</a></p>` : ''}
                        ${contact.website ? `<p>🌐 <a href="${contact.website}" target="_blank">${contact.website}</a></p>` : ''}
                        <p>🕐 ${contact.hours}</p>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.warn('Не удалось загрузить контакты экстренной помощи:', error);
            // Не показываем уведомление - это не критично для работы приложения
        }
    }

    /**
     * Инициализация доступности
     */
    initAccessibility() {
        // Добавить aria-label для интерактивных элементов без текста
        $$('button:not([aria-label]), a:not([aria-label])').forEach(element => {
            if (!element.textContent.trim()) {
                const icon = element.innerHTML;
                let label = '';
                
                if (icon.includes('🏃') || element.id === 'emergencyExit') label = 'Быстрый выход с сайта';
                else if (icon.includes('↑') || element.id === 'scrollTop' || element.id === 'scrollTopBtn') label = 'Наверх';
                else if (icon.includes('🔍')) label = 'Поиск';
                else if (icon.includes('📞')) label = 'Позвонить';
                
                if (label) {
                    element.setAttribute('aria-label', label);
                }
            }
        });
        
        // Управление фокусом для модальных окон
        this.initFocusTrap();
        
        // Добавить skiplinks для клавиатурной навигации
        this.addSkipLinks();
    }

    /**
     * Инициализация ловушки фокуса для модальных окон
     */
    initFocusTrap() {
        document.addEventListener('keydown', (e) => {
            const modal = $('.modal[style*="display: flex"]');
            if (!modal || e.key !== 'Tab') return;
            
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        });
    }

    /**
     * Добавление ссылок для пропуска контента
     */
    addSkipLinks() {
        if ($('.page__skip-links')) return;
        
        const skipLinks = utils.createElement('div', {
            className: 'page__skip-links',
            style: `
                position: absolute;
                top: -40px;
                left: 0;
                right: 0;
                z-index: 9999;
            `
        });
        
        skipLinks.innerHTML = `
            <a href="#main" class="page__skip-link">Перейти к основному контенту</a>
            <a href="#navigation" class="page__skip-link">Перейти к навигации</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Стили для skiplinks
        if (!$('#skip-links-styles')) {
            const style = utils.createElement('style', {
                id: 'skip-links-styles'
            }, `
                .page__skip-links {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    right: 0;
                    z-index: 9999;
                }
                .page__skip-link {
                    position: absolute;
                    top: -40px;
                    left: 0;
                    background: #8AA2A9;
                    color: white;
                    padding: 0.5rem 1rem;
                    text-decoration: none;
                    transition: top 0.3s;
                }
                .page__skip-link:focus {
                    top: 0;
                }
            `);
            document.head.appendChild(style);
        }
    }

    /**
     * Инициализация аналитики
     */
    initAnalytics() {
        // Простая аналитика без внешних сервисов
        this.trackPageView();
        
        // Отслеживание кликов по важным элементам
        this.initClickTracking();
    }

    /**
     * Отслеживание просмотров страниц
     */
    trackPageView() {
        const pageViews = utils.loadFromLocalStorage('page_views', []);
        pageViews.push({
            page: this.currentPage,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct'
        });
        utils.saveToLocalStorage('page_views', pageViews.slice(-100));
    }

    /**
     * Отслеживание кликов
     */
    initClickTracking() {
        // Трекинг кликов по основным CTA
        const ctaSelectors = [
            '.hero__button',
            '.test-card__button',
            '.exercise-card__button',
            '.quick-access__card-link',
            '.contact-card__action--call'
        ];
        
        ctaSelectors.forEach(selector => {
            $$(selector).forEach(button => {
                button.addEventListener('click', () => {
                    const clicks = utils.loadFromLocalStorage('cta_clicks', []);
                    clicks.push({
                        element: selector,
                        page: this.currentPage,
                        timestamp: new Date().toISOString()
                    });
                    utils.saveToLocalStorage('cta_clicks', clicks.slice(-50));
                });
            });
        });
    }

    /**
     * Загрузка данных для конкретной страницы
     */
    async loadPageSpecificData() {
        switch (this.currentPage) {
            case 'articles.html':
                if (typeof window.initArticles === 'function') {
                    await window.initArticles();
                }
                break;
                
            case 'tests.html':
                if (typeof window.initTests === 'function') {
                    await window.initTests();
                }
                break;
                
            case 'mood-tracker.html':
                if (typeof window.initMoodTracker === 'function') {
                    await window.initMoodTracker();
                }
                break;
                
            case 'exercises.html':
                if (typeof window.initExercises === 'function') {
                    await window.initExercises();
                }
                break;
                
            case 'contacts.html':
                if (typeof window.initContacts === 'function') {
                    await window.initContacts();
                }
                break;
        }
    }

    /**
     * Показать приветственное сообщение для новых пользователей
     */
    showWelcomeMessage() {
        const hasVisited = utils.loadFromLocalStorage('has_visited', false);
        
        if (!hasVisited) {
            setTimeout(() => {
                utils.showNotification(
                    'Добро пожаловать! Здесь вы найдете инструменты для заботы о психическом здоровье.',
                    'info',
                    5000
                );
                utils.saveToLocalStorage('has_visited', true);
            }, 1500);
        }
    }

    /**
     * Показать предупреждение о неподдерживаемом localStorage
     */
    showLocalStorageWarning() {
        utils.showNotification(
            'Ваш браузер не поддерживает сохранение данных. Некоторые функции могут быть недоступны.',
            'warning',
            10000
        );
    }

    /**
     * Очистка всех данных пользователя
     */
    clearAllUserData() {
        if (confirm('Вы уверены, что хотите удалить все ваши данные? Это действие нельзя отменить.')) {
            const keysToKeep = ['has_visited', 'page_views'];
            const allKeys = Object.keys(localStorage);
            
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            utils.showNotification('Все ваши данные удалены', 'success');
            
            setTimeout(() => location.reload(), 1000);
        }
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, запускаем приложение...');
    window.app = new MentalHealthApp();
});

// Экспорт для использования в других модулях
window.MentalHealthApp = MentalHealthApp;

// Анимация появления элементов при скролле
function initScrollAnimations() {
    const elements = document.querySelectorAll('.quick-access__card, .article-card, .stats__item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => observer.observe(element));
}

// Подсветка активного раздела навигации
function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header__nav-link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('header__nav-link--active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('header__nav-link--active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5
    });
    
    sections.forEach(section => observer.observe(section));
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    highlightActiveSection();
});

// Дополнительная проверка: если кнопка все еще не работает, добавляем глобальный обработчик
setTimeout(() => {
    const btn = document.getElementById('emergencyExit');
    if (btn) {
        console.log('Проверка: кнопка найдена, добавляем дополнительный обработчик');
        btn.addEventListener('click', function(e) {
            console.log('ДОПОЛНИТЕЛЬНЫЙ ОБРАБОТЧИК СРАБОТАЛ!');
            e.preventDefault();
            e.stopImmediatePropagation();
            if (window.app && window.app.performEmergencyExit) {
                window.app.performEmergencyExit();
            } else {
                window.location.href = 'https://www.google.com';
            }
            return false;
        }, true); // Используем capture phase
    }
}, 2000);

