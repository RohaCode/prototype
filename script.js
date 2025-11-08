// --- Константы игры ---
const CLICKS_TO_OPEN = 10; // Кол-во кликов для быстрого теста

// Элементы дизайна
const tg = window.Telegram.WebApp;
const userInfoEl = document.getElementById('user-info');
const chestEl = document.getElementById('chest');
const progressEl = document.getElementById('progress');
const progressTextEl = document.getElementById('progress-text');
const messageEl = document.getElementById('message');
const adButtonEl = document.getElementById('ad-button');

// Состояние игры
let clickCount = 0;
let isChestLocked = false; // Проверка блокировку сундука
let isAdPlaying = false; // Проверка просмотра рекламы

// --- Инициализация приложения ---
let AdController; // Глобальный AdController

window.addEventListener('load', () => {
    // Приложение готово
    tg.ready();
    
    // Авторизация и получение данных пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const userName = user.first_name || user.username || 'Игрок';
        userInfoEl.innerText = `Игрок: ${userName}`;

        // Инициализация Adsgram , после получения данных пользователя
        if (window.Adsgram) {
            console.log("Telegram WebApp is ready. Initializing Adsgram...");
            AdController = window.Adsgram.init({
                blockId: "17141",
                debug: true,
                debugConsole: true
            });
            console.log("Adsgram initialized in debug mode.");
        } else {
            console.error("Adsgram SDK not loaded (window.Adsgram is undefined).");
        }

    } else {
        userInfoEl.innerText = 'Игрок: Гость (Запустите в Telegram)';
        console.warn("Telegram WebApp initDataUnsafe or user data not available. Adsgram will not be initialized.");
    }
    
    // Открываем приложение на весь экран ( хотя это уже не надо , так как при настройке мини апп в боте , там уже это все сразу устанавливается)
    tg.expand();
});

// Логика кликера
chestEl.addEventListener('click', () => {
    if (isChestLocked || isAdPlaying) {
        // Блокировка кликов пока не посмотрели рекламу
        return;
    }

    clickCount++;
    
    // Обновляем прогресс-бар
    const progressPercentage = Math.min((clickCount / CLICKS_TO_OPEN) * 100, 100);
    progressEl.style.width = `${progressPercentage}%`;
    // Обновления прогресса
    progressTextEl.innerText = `${Math.floor(progressPercentage)}%`;

    // Открытие сундука
    if (clickCount >= CLICKS_TO_OPEN) {
        openChest();
    }
});

function openChest() {
    // Показываем награду
    messageEl.innerText = 'Сундук открыт! Отличная работа!';
    chestEl.innerHTML = '&#127881;'; // Заглушка
    
    // Блокируем сундук
    isChestLocked = true;
    
    // Показываем кнопку рекламы
    adButtonEl.style.display = 'block';
}

// Логика показа рекламы
adButtonEl.addEventListener('click', () => {
    if (isAdPlaying) return;

    isAdPlaying = true;
    adButtonEl.disabled = true;
    messageEl.innerText = 'Загрузка рекламы...';

    if (AdController) {
        AdController.show()
            .then(() => {
                // Реклама показана успешно
                messageEl.innerText = 'Реклама успешно показана!';
                onAdWatched();
            })
            .catch((error) => {
                // Ошибка при показе рекламы
                console.error("Ошибка при показе рекламы Adsgram:", error);
                messageEl.innerText = 'Не удалось показать рекламу или она была пропущена.';
                isAdPlaying = false;
                adButtonEl.disabled = false;
            });
    } else {
        messageEl.innerText = 'Adsgram не инициализирован. Невозможно показать рекламу.';
        isAdPlaying = false;
        adButtonEl.disabled = false;
        console.error("AdController is not initialized.");
    }
});

// Награда после просмотра
function onAdWatched() {
    messageEl.innerText = 'Спасибо за просмотр! Следующий сундук готов.';
    
    // Сброс игры в начальное состояние
    resetGame();
}

function resetGame() {
    clickCount = 0;
    isChestLocked = false;
    isAdPlaying = false;
    
    adButtonEl.style.display = 'none';
    adButtonEl.disabled = false;
    
    progressEl.style.width = '0%';
    progressTextEl.innerText = `0%`; // Сбрасываем на 0%
    chestEl.innerHTML = '&#127873;'; // Снова закрытый подарок
    
    // Очищаем сообщение через пару секунд
    setTimeout(() => {
        if (!isChestLocked) { // Не очищаем 
            messageEl.innerText = '';
        }
    }, 2000);
}
