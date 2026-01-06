// articles-simple.js — СТАТЬИ С МОДАЛЬНЫМИ ОКНАМИ

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('articlesGrid');

    // Создаём модальное окно для статей, если его ещё нет
    if (!document.getElementById('articleModal')) {
        const modalHTML = `
            <div class="modal modal--article" id="articleModal" role="dialog" aria-labelledby="articleModalTitle" aria-modal="true" hidden>
                <div class="modal__overlay" data-modal-close></div>
                <div class="modal__container modal__container--large">
                    <div class="modal__header">
                        <h2 class="modal__title" id="articleModalTitle">Статья</h2>
                        <button class="modal__close" data-modal-close aria-label="Закрыть">×</button>
                    </div>
                    <div class="modal__body" id="articleModalBody">
                        <!-- Контент статьи будет вставлен сюда -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Добавляем обработчики закрытия модального окна
        const modal = document.getElementById('articleModal');
        modal.querySelectorAll('[data-modal-close]').forEach(element => {
            element.addEventListener('click', function(e) {
                if (e.target === this || this.classList.contains('modal__close')) {
                    closeArticleModal();
                }
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('articleModal');
                if (modal && !modal.hidden) {
                    closeArticleModal();
                }
            }
        });
    }

    // Функция открытия модального окна со статьёй
    function openArticleModal(article) {
        const modal = document.getElementById('articleModal');
        const title = document.getElementById('articleModalTitle');
        const body = document.getElementById('articleModalBody');
        
        // Очищаем контент от эмодзи в заголовках
        let cleanedContent = article.content;
        const emojiPattern = /[🔍🚫❶❷❸❹❺❻💡🔄🛡️🚨⏱️📝🔒]/g;
        cleanedContent = cleanedContent.replace(/<h2>([^<]*?)([🔍🚫❶❷❸❹❺❻💡🔄🛡️🚨⏱️📝🔒]+)\s*/g, '<h2>$1');
        cleanedContent = cleanedContent.replace(/<h2>\s*([🔍🚫❶❷❸❹❺❻💡🔄🛡️🚨⏱️📝🔒]+)\s*/g, '<h2>');
        
        title.textContent = article.title;
        body.innerHTML = `
            <div class="article-modal__meta">
                <span class="article-modal__category">${article.category}</span>
                <span class="article-modal__date">${formatDate(article.date)}</span>
                <span class="article-modal__read-time">${article.readTime} мин чтения</span>
            </div>
            <div class="article-modal__content">
                ${cleanedContent}
            </div>
        `;
        
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Удаляем эмодзи из заголовков после отображения
        setTimeout(() => {
            const h2Elements = body.querySelectorAll('h2');
            h2Elements.forEach(h2 => {
                let text = h2.innerHTML;
                text = text.replace(emojiPattern, '');
                text = text.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
                h2.innerHTML = text;
            });
        }, 50);
    }
    
    // Функция закрытия модального окна
    function closeArticleModal() {
        const modal = document.getElementById('articleModal');
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    // Загрузка статей с fallback на встроенные данные
    async function loadArticles() {
        try {
            const isInPagesDir = window.location.pathname.includes('/pages/');
            const basePath = isInPagesDir ? '../data/articles.json' : 'data/articles.json';
            
            const res = await fetch(basePath);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            return data.articles || [];
        } catch (err) {
            console.warn('Fetch не удался, используем встроенные данные:', err.message);
            // Fallback на встроенные данные (если доступны)
            if (window.ARTICLES_DATA && window.ARTICLES_DATA.articles) {
                return window.ARTICLES_DATA.articles;
            }
            throw err;
        }
    }

    try {
        const articles = await loadArticles();

        // Сортировка по дате (новые сверху)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        grid.innerHTML = articles.map(article => {
            // Определяем иконку по категории статьи (только для fallback, если нет изображения)
            const categoryIcons = {
                'stress': '😰',
                'burnout': '🔥',
                'myths': '💡',
                'help': '🤝',
                'mood': '😊',
                'anxiety': '😟',
                'education': '📚'
            };
            const icon = categoryIcons[article.category] || '📄';
            
            return `
            <article class="article-card" data-article-id="${article.id}">
                <div class="article-card__image">
                    ${article.image && article.image !== '' 
                        ? `<img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'article-card__image-placeholder\\'>${icon}</div>'">`
                        : `<div class="article-card__image-placeholder">${icon}</div>`
                    }
                </div>
                <div class="article-card__content">
                    <h3 class="article-card__title">${article.title}</h3>
                    <p class="article-card__excerpt">${article.excerpt}</p>
                    <div class="article-card__meta">
                        <span>${formatDate(article.date)}</span> • ${article.readTime} мин чтения
                    </div>
                    
                    <!-- Кнопка открытия в модальном окне -->
                    <button class="article-card__toggle" data-article-id="${article.id}">
                        Читать полностью
                    </button>
                </div>
            </article>
        `;
        }).join('');

        // Обработчики кнопок - открытие модального окна
        document.querySelectorAll('.article-card__toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.articleId;
                const article = articles.find(a => a.id === id);
                if (article) {
                    openArticleModal(article);
                }
            });
        });

    } catch (e) {
        console.error('Ошибка загрузки статей:', e);
        grid.innerHTML = '<p style="text-align:center;color:#888;padding:4rem;">Не удалось загрузить статьи 😔<br><small style="color:#ccc;">Попробуйте открыть сайт через локальный сервер (start-server.bat)</small></p>';
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        });
    }
});
