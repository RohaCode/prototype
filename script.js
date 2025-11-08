// --- Константы игры ---
const CLICKS_TO_OPEN = 10; // Ставим 10 для удобства тестирования

// --- Элементы UI ---
const tg = window.Telegram.WebApp;
const userInfoEl = document.getElementById('user-info');
const userAvatarEl = document.getElementById('user-avatar');
const userNameDisplayEl = document.getElementById('user-name-display');
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
window.addEventListener('load', () => {
    // Сообщаем Telegram, что приложение готово
    tg.ready();
    
    // 2. Авторизация и получение данных пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('Telegram User Object:', user); // Log the user object for debugging
        const userName = user.first_name || user.username || 'Игрок';
        userNameDisplayEl.innerText = `Игрок: ${userName}`;

        if (user.photo_url) {
            userAvatarEl.src = user.photo_url;
        }
        // No need to hide/show, as index.html now has a default src and is always visible.
        // If user.photo_url is not present, the placeholder will be shown.
    } else {
        userNameDisplayEl.innerText = 'Игрок: Гость (Запустите в Telegram)';
        // If no user data, the placeholder will be shown.
    }
    
    // Расширяем приложение на всю высоту
    tg.expand();
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

// --- Логика рекламы (Симуляция) ---
adButtonEl.addEventListener('click', () => {
    if (isAdPlaying) return;

    isAdPlaying = true;
    adButtonEl.disabled = true;
    messageEl.innerText = 'Идет просмотр рекламы...';

    // *** СИМУЛЯЦИЯ РЕКЛАМЫ ***
    // На этом месте должен быть вызов реального SDK, например:
    // tg.Ads.showRewardedVideo({ ad_unit_id: 'YOUR_AD_UNIT_ID' }, (result) => {
    //     if (result.success) {
    //         // Реклама просмотрена, даем награду
    //         onAdWatched();
    //     } else {
    //         // Ошибка или реклама закрыта
    //         messageEl.innerText = 'Нужно досмотреть рекламу, чтобы продолжить!';
    //         isAdPlaying = false;
    //         adButtonEl.disabled = false;
    //     }
    // });
    
    // Используем setTimeout для симуляции просмотра (3 секунды)
    setTimeout(() => {
        onAdWatched(); // Вызываем коллбэк "успешного просмотра"
    }, 3000);
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
