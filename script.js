// --- Константы игры ---
const CLICKS_TO_OPEN = 10; // Ставим 10 для удобства тестирования

// --- Элементы UI ---
const tg = window.Telegram.WebApp;
const userInfoEl = document.getElementById('user-info');
const chestEl = document.getElementById('chest');
const progressEl = document.getElementById('progress');
const progressTextEl = document.getElementById('progress-text');
const messageEl = document.getElementById('message');
const adButtonEl = document.getElementById('ad-button');

// --- Состояние игры ---
let clickCount = 0;
let isChestLocked = false; // Заблокирован ли сундук (в ожидании рекламы)
let isAdPlaying = false; // Идет ли "просмотр" рекламы

// --- Инициализация приложения ---
let AdController; // Объявляем AdController здесь, чтобы он был доступен глобально

window.addEventListener('load', () => {
    // Сообщаем Telegram, что приложение готово
    tg.ready();
    
    // 2. Авторизация и получение данных пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        const userName = user.first_name || user.username || 'Игрок';
        userInfoEl.innerText = `Игрок: ${userName}`;
    } else {
        userInfoEl.innerText = 'Игрок: Гость (Запустите в Telegram)';
    }
    
    // Расширяем приложение на всю высоту
    tg.expand();

    // Инициализация Adsgram
    // ВНИМАНИЕ: Замени "YOUR_ADSGRAM_BLOCK_ID" на свой реальный blockId с partner.adsgram.ai
    if (window.Adsgram) {
        AdController = window.Adsgram.init({
            blockId: "r-17141",
            debug: true, // Включаем режим отладки для тестирования
            debugConsole: true // Выводим логи отладки в консоль
        });
        console.log("Adsgram initialized in debug mode.");
    } else {
        console.error("Adsgram SDK not loaded.");
    }
});

// --- Логика геймплея (Кликер) ---
chestEl.addEventListener('click', () => {
    if (isChestLocked || isAdPlaying) {
        // Не даем кликать, если сундук заблокирован или идет реклама
        return;
    }

    clickCount++;
    
    // 3. Обновляем прогресс-бар
    const progressPercentage = Math.min((clickCount / CLICKS_TO_OPEN) * 100, 100);
    progressEl.style.width = `${progressPercentage}%`;
    // Обновляем текст, округляя до целого процента
    progressTextEl.innerText = `${Math.floor(progressPercentage)}%`;

    // 4. Сундук открыт
    if (clickCount >= CLICKS_TO_OPEN) {
        openChest();
    }
});

function openChest() {
    // 4.1. Показываем награду
    messageEl.innerText = 'Сундук открыт! Отличная работа!';
    chestEl.innerHTML = '&#127881;'; // Эмодзи награды (хлопушка/tada)
    
    // 4.2. Блокируем сундук
    isChestLocked = true;
    
    // 5. Показываем кнопку рекламы
    adButtonEl.style.display = 'block';
}

// --- Логика рекламы (Симуляция заменена на Adsgram) ---
adButtonEl.addEventListener('click', () => {
    if (isAdPlaying) return;

    isAdPlaying = true;
    adButtonEl.disabled = true;
    messageEl.innerText = 'Загрузка рекламы...';

    if (AdController) {
        AdController.show()
            .then(() => {
                // Реклама показана успешно (просмотрена или закрыта)
                messageEl.innerText = 'Реклама успешно показана!';
                onAdWatched();
            })
            .catch((error) => {
                // Ошибка при показе рекламы или пользователь пропустил
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

// 6. Функция "награды" после просмотра
function onAdWatched() {
    messageEl.innerText = 'Спасибо за просмотр! Следующий сундук готов.';
    
    // Сбрасываем игру в начальное состояние
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
        if (!isChestLocked) { // Не очищаем, если уже что-то новое
            messageEl.innerText = '';
        }
    }, 2000);
}
