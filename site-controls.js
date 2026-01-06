/**
 * ============================================
 * УПРАВЛЕНИЕ БЫСТРЫМ ВЫХОДОМ И ЭКСТРЕННОЙ ПОМОЩЬЮ
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // БЫСТРЫЙ ВЫХОД
    // ============================================

    const QuickExit = {
        GOOGLE_URL: 'https://www.google.com',

        /**
         * Инициализация быстрого выхода
         */
        init() {
            this.bindEvents();
            console.log('QuickExit: инициализирован');
        },

        /**
         * Выполнить быстрый выход
         */
        performExit() {
            console.log('QuickExit: выполняется выход');
            
            // Немедленно перенаправляем на Google
            // Используем replace чтобы убрать страницу из истории браузера
            window.location.replace(this.GOOGLE_URL);
        },

        /**
         * Привязать события
         */
        bindEvents() {
            // Привязываем ко всем кнопкам быстрого выхода
            document.addEventListener('click', (e) => {
                const exitBtn = e.target.closest('.site-controls__btn--exit, #emergencyExit, [data-quick-exit]');
                if (exitBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.performExit();
                }
            });

            // Привязываем клавиатурное сокращение (Escape + Shift)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && e.shiftKey) {
                    e.preventDefault();
                    this.performExit();
                }
            });
        }
    };

    // ============================================
    // КНОПКА "НАВЕРХ"
    // ============================================

    const ScrollToTop = {
        /**
         * Инициализация
         */
        init() {
            this.bindEvents();
            console.log('ScrollToTop: инициализирован');
        },

        /**
         * Прокрутить наверх
         */
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        },

        /**
         * Обновить видимость кнопки
         */
        updateVisibility() {
            const scrollBtn = document.querySelector('.site-controls__btn--scroll-top, #scrollTopBtn');
            if (scrollBtn) {
                if (window.pageYOffset > 300) {
                    scrollBtn.classList.add('site-controls__btn--visible', 'visible');
                } else {
                    scrollBtn.classList.remove('site-controls__btn--visible', 'visible');
                }
            }
        },

        /**
         * Привязать события
         */
        bindEvents() {
            // Показывать/скрывать кнопку при прокрутке
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateVisibility();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Клик по кнопке
            document.addEventListener('click', (e) => {
                const scrollBtn = e.target.closest('.site-controls__btn--scroll-top, #scrollTopBtn');
                if (scrollBtn) {
                    e.preventDefault();
                    this.scrollToTop();
                }
            });
        }
    };

    // ============================================
    // СОЗДАНИЕ ПАНЕЛИ УПРАВЛЕНИЯ
    // ============================================

    const SiteControls = {
        /**
         * Создать панель управления сайтом
         */
        createControlPanel() {
            // Проверяем, нет ли уже панели
            if (document.querySelector('.site-controls')) {
                return;
            }

            const controlPanel = document.createElement('div');
            controlPanel.className = 'site-controls';
            controlPanel.innerHTML = `
                <!-- Кнопка наверх -->
                <button class="site-controls__btn site-controls__btn--scroll-top" 
                        aria-label="Наверх" 
                        title="Наверх">
                    <span class="site-controls__btn-icon">↑</span>
                </button>
                
                <!-- Кнопка экстренной помощи -->
                <button class="site-controls__btn site-controls__btn--emergency" 
                        aria-label="Экстренная помощь" 
                        title="Экстренная помощь"
                        data-emergency-help>
                    <span class="site-controls__btn-icon">🚨</span>
                    <span class="site-controls__btn-text">Помощь</span>
                </button>
                
                <!-- Быстрый выход -->
                <button class="site-controls__btn site-controls__btn--exit" 
                        aria-label="Быстрый выход" 
                        title="Быстрый выход (Shift + Escape)"
                        data-quick-exit>
                    <span class="site-controls__btn-icon">🚪</span>
                    <span class="site-controls__btn-text">Выход</span>
                </button>
            `;

            document.body.appendChild(controlPanel);
            console.log('SiteControls: панель управления создана');
        },

        /**
         * Инициализация
         */
        init() {
            this.createControlPanel();
            this.bindEvents();
        },

        /**
         * Привязать события
         */
        bindEvents() {
            // Открытие модального окна экстренной помощи
            document.addEventListener('click', (e) => {
                const emergencyBtn = e.target.closest('[data-emergency-help], .site-controls__btn--emergency');
                if (emergencyBtn) {
                    e.preventDefault();
                    const modal = document.getElementById('emergencyModal');
                    if (modal) {
                        modal.hidden = false;
                        document.body.style.overflow = 'hidden';
                    }
                }
            });
        }
    };

    // ============================================
    // МОБИЛЬНОЕ МЕНЮ (БУРГЕР)
    // ============================================

    const MobileMenu = {
        menuToggle: null,
        nav: null,
        isOpen: false,

        /**
         * Инициализация мобильного меню
         */
        init() {
            this.menuToggle = document.getElementById('menuToggle');
            this.nav = document.querySelector('.header__nav');

            if (!this.menuToggle || !this.nav) {
                console.warn('MobileMenu: элементы меню не найдены');
                return;
            }

            this.bindEvents();
            console.log('MobileMenu: инициализирован');
        },

        /**
         * Открыть меню
         */
        open() {
            this.isOpen = true;
            this.menuToggle.setAttribute('aria-expanded', 'true');
            this.nav.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            this.nav.style.display = 'flex';
        },

        /**
         * Закрыть меню
         */
        close() {
            this.isOpen = false;
            this.menuToggle.setAttribute('aria-expanded', 'false');
            this.nav.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            // На мобильных скрываем меню через CSS, не убираем display
        },

        /**
         * Переключить меню
         */
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },

        /**
         * Привязать события
         */
        bindEvents() {
            const self = this;

            // Клик по кнопке бургера
            this.menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                self.toggle();
            });

            // Закрытие по клику на ссылку в меню
            this.nav.querySelectorAll('.header__nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    self.close();
                });
            });

            // Закрытие по клику вне меню
            document.addEventListener('click', (e) => {
                if (self.isOpen && 
                    !self.nav.contains(e.target) && 
                    !self.menuToggle.contains(e.target)) {
                    self.close();
                }
            });

            // Закрытие по Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && self.isOpen) {
                    self.close();
                    self.menuToggle.focus();
                }
            });

            // Закрытие при изменении размера окна (если становится больше мобильного)
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768 && self.isOpen) {
                    self.close();
                }
            });
        }
    };

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
    // ============================================

    function init() {
        // Создаём элементы управления
        SiteControls.init();
        
        // Инициализируем остальные модули
        QuickExit.init();
        ScrollToTop.init();
        MobileMenu.init();
        
        // Удаляем старую кнопку быстрого выхода с inline стилями
        const oldExitBtn = document.getElementById('emergencyExit');
        if (oldExitBtn && oldExitBtn.style.cssText.includes('position:fixed')) {
            oldExitBtn.remove();
        }
        
        console.log('Site Controls: все модули инициализированы');
    }

    // Запускаем при готовности DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Экспортируем для использования извне
    window.QuickExit = QuickExit;
    window.ScrollToTop = ScrollToTop;
    window.SiteControls = SiteControls;
    window.MobileMenu = MobileMenu;

})();
