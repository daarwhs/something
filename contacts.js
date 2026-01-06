// contacts.js — Финальная версия с фильтром Приднестровья

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('contactsGrid');
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');
    let allContacts = [];
    let currentContacts = [];

    // Функция сортировки: Приднестровье первым
    function sortContactsPridnestrovieFirst(contacts) {
        return [...contacts].sort((a, b) => {
            const aIsPMR = a.region === 'pridnestrovie' ? 0 : 1;
            const bIsPMR = b.region === 'pridnestrovie' ? 0 : 1;
            if (aIsPMR !== bIsPMR) return aIsPMR - bIsPMR;
            // Если оба из одного региона, сортируем по рейтингу
            return (b.rating || 0) - (a.rating || 0);
        });
    }

    // Загрузка контактов с fallback на встроенные данные
    async function loadContacts() {
        // Сначала пробуем fetch
        try {
            const isInPagesDir = window.location.pathname.includes('/pages/');
            const basePath = isInPagesDir ? '../data/contacts.json' : 'data/contacts.json';
            
            const response = await fetch(basePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.contacts || [];
        } catch (err) {
            console.warn('Fetch не удался, используем встроенные данные:', err.message);
            // Fallback на встроенные данные (если доступны)
            if (window.CONTACTS_DATA && window.CONTACTS_DATA.contacts) {
                return window.CONTACTS_DATA.contacts;
            }
            throw err;
        }
    }

    try {
        const contacts = await loadContacts();
        // Сортируем контакты: Приднестровье первым
        allContacts = sortContactsPridnestrovieFirst(contacts);
        currentContacts = [...allContacts];
        renderContacts(currentContacts);
    } catch (err) {
        console.error('Ошибка загрузки контактов:', err);
        grid.innerHTML = `
            <div style="text-align:center;padding:4rem;color:#e74c3c;font-size:1.1rem;">
                Не удалось загрузить список контактов
                <br><small style="color:#888;font-size:0.85rem;margin-top:0.5rem;display:block;">Попробуйте открыть сайт через локальный сервер (start-server.bat)</small>
            </div>`;
        if (noResults) noResults.style.display = 'none';
    }

    // Названия типов
    function getTypeBadge(type) {
        const badges = {
            crisis: 'Кризисная помощь',
            university: 'Вуз',
            online: 'Онлайн',
            free: 'Бесплатные ресурсы'
        };
        return badges[type] || 'Помощь';
    }

    // Создание карточки
    function createCard(contact) {
        const card = document.createElement('div');
        card.className = 'contact-card';
        card.dataset.type = contact.type;

        card.innerHTML = `
            <div class="contact-card__header">
                <h3 class="contact-card__name">${contact.name}</h3>
                <span class="contact-card__type">${getTypeBadge(contact.type)}</span>
            </div>

            ${contact.phone ? `
                <p class="contact-card__phone">
                    <a href="tel:${contact.phone.replace(/\s/g,'')}">Телефон: ${contact.phone}</a>
                </p>` : ''}

            ${contact.website ? `
                <p class="contact-card__site">
                    <a href="${contact.website}" target="_blank" rel="noopener">
                        Сайт: ${contact.website.replace(/^https?:\/\//, '')}
                    </a>
                </p>` : ''}

            ${contact.hours ? `<p class="contact-card__hours">${contact.hours}</p>` : ''}
            ${contact.city && contact.city !== 'Онлайн' ? `<p class="contact-card__city">${contact.city}</p>` : ''}

            <p class="contact-card__description">${contact.description || ''}</p>
        `;

        // Анимация появления
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);

        return card;
    }

    // Рендер
    function renderContacts(contacts) {
        grid.innerHTML = '';
        if (contacts.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        const fragment = document.createDocumentFragment();
        contacts.forEach(contact => fragment.appendChild(createCard(contact)));
        grid.appendChild(fragment);
    }

    // Умный поиск
    function performSearch(query) {
        if (!query.trim()) return allContacts;
        const q = query.toLowerCase();
        return allContacts.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.city?.toLowerCase().includes(q) ||
            c.phone?.includes(query) ||
            c.website?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q) ||
            c.specialization?.some(s => s.toLowerCase().includes(q))
        );
    }

    // Поиск с дебаунсом
    let timeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const query = searchInput.value.trim();
            const bySearch = performSearch(query);
            const activeFilter = document.querySelector('.contacts-controls__filter-button--active')?.dataset.filter || 'all';
            const result = activeFilter === 'all' ? bySearch : bySearch.filter(c => c.type === activeFilter);
            currentContacts = result;
            renderContacts(result);
        }, 300);
    });

    // Фильтры
    document.querySelectorAll('.contacts-controls__filter-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.contacts-controls__filter-button').forEach(b => b.classList.remove('contacts-controls__filter-button--active'));
            btn.classList.add('contacts-controls__filter-button--active');

            const filter = btn.dataset.filter;
            let list;
            
            if (filter === 'all') {
                list = allContacts;
            } else if (filter === 'pridnestrovie') {
                // Фильтр по региону Приднестровье
                list = allContacts.filter(c => c.region === 'pridnestrovie');
            } else {
                // Фильтр по типу (crisis, university, online)
                list = allContacts.filter(c => c.type === filter);
            }

            const query = searchInput.value.trim();
            if (query) {
                const searchResults = performSearch(query);
                if (filter === 'all') {
                    list = searchResults;
                } else if (filter === 'pridnestrovie') {
                    list = searchResults.filter(c => c.region === 'pridnestrovie');
                } else {
                    list = searchResults.filter(c => c.type === filter);
                }
            }

            currentContacts = list;
            renderContacts(list);
        });
    });
});