// Игровые параметры
let player = {
    pressure: 20,
    fear: 10,
    hope: 30
};

// Старт главы
function startChapter1() {
    showBankScreen();
}

// Экран 1: Банк
function showBankScreen() {
    showText(
`Kaspi Bank

Кредиты:
- Потребительский: просрочка 18 дней
- Рассрочка: просрочка 9 дней
- Штрафы и пени начисляются

Доступно: 1 240 ₸

Уведомление: "Погасите задолженность во избежание ограничений"`,
    () => {
        showChoices([
            {text: "Посмотреть детали долгов", action: () => {player.pressure+=5; showJobSearch();}},
            {text: "Закрыть приложение", action: () => {player.pressure+=2; showJobSearch();}},
            {text: "Включить режим 'без звука'", action: () => {player.hope+=5; showJobSearch();}}
        ]);
    });
}

// Экран 2: Поиск работы
function showJobSearch() {
    showText(
`Ты открываешь сайты с вакансиями.

Фильтр: официальная работа
Зарплата: от 250 000 ₸

Несколько вариантов требуют опыта, ночных смен или собственного транспорта.

Один вариант выглядит идеально:
"Удалённая работа. Доход: 400 000+. Опыт не нужен. Начало сразу."`,
    () => {
        showChoices([
            {text: "Откликнуться на вакансию", action: showTelegramIntro},
            {text: "Продолжить поиск", action: () => {player.pressure+=2; showJobSearch();}},
            {text: "Сменить фильтр", action: () => {player.hope-=2; showJobSearch();}}
        ]);
    });
}

// Экран 3: Telegram — первый контакт
function showTelegramIntro() {
    showText(
`Ты пишешь в Telegram:
"Здравствуйте. Я по вакансии."

Через несколько минут приходит ответ:
"Привет. Работа удалённая, простой график. Опыт не нужен. Всё официально."`,
    () => {
        showChoices([
            {text: "Спросить про обязанности", action: showJobDetails},
            {text: "Спросить про оформление", action: showJobDetails},
            {text: "Спросить про оплату", action: showJobDetails}
        ]);
    });
}

// Экран 4: Описание работы
function showJobDetails() {
    showText(
`Ответ в чате:
"Работа связана с финансовыми операциями. Иногда деньги приходят на твою карту и их нужно перевести дальше.
Деньги не ваши, ответственности нет. Мы всё объясняем."`,
    () => {
        showChoices([
            {text: "Спросить, законно ли это", action: showReassurance},
            {text: "Сказать, что нужно подумать", action: showReassurance},
            {text: "Согласиться продолжить", action: showTestStep}
        ]);
    });
}

// Экран 5: Успокаивающее сообщение
function showReassurance() {
    showText(
`Ответ:
"Понимаю ваши сомнения. Вы можете отказаться в любой момент.
Многие сначала переживают — это нормально."`,
    () => {
        showChoices([
            {text: "Согласиться на тест", action: showTestStep},
            {text: "Взять паузу", action: () => {player.hope+=5; showReassurance();}},
            {text: "Отказаться", action: () => {player.hope+=10; showBankScreen();}}
        ]);
    });
}

// Экран 6: Первый тестовый перевод
function showTestStep() {
    showText(
`Сообщение в чате:
"Готов? Сейчас будет тестовый платёж. Просто проверь, что дошло."  

Телефон уведомляет: Перевод зачислен: 487 000 ₸`,
    () => {
        showChoices([
            {text: "Проверить платёж и выполнить инструкцию", action: () => {player.pressure+=20; endChapter();}},
            {text: "Попросить объяснить, что за деньги", action: () => {player.hope+=5; showReassurance();}},
            {text: "Не трогать карту", action: () => {player.fear+=5; showReassurance();}}
        ]);
    });
}

// Конец главы (будет продолжение в следующем файле)
function endChapter() {
    showText(
`ГЛАВА 1 ЗАВЕРШЕНА
Ты ещё не дроп полностью, но ты уже в шаге.`
    );
}

// Запуск
startChapter1();
