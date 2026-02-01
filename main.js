// --- КОНФИГУРАЦИЯ ---
const config = {
    maxDeals: 12, // Количество сделок до "тюрьмы"
    initialMoney: 1500,
    curatorName: "Админ | DarkWork"
};

// --- СОСТОЯНИЕ ИГРЫ ---
let state = {
    money: config.initialMoney,
    usdt: 0,
    dealsCount: 0,
    activeJob: null, // Текущее задание
    history: [],
    viewStack: ['view-home'],
    isPolice: false
};

// --- СИСТЕМА ПРИЛОЖЕНИЙ И НАВИГАЦИИ ---
const app = {
    open: (appName) => {
        const viewId = `view-${appName}`;
        const current = document.querySelector('.view.active');
        const next = document.getElementById(viewId);
        
        if (current && next) {
            state.viewStack.push(viewId);
            current.classList.remove('active');
            next.classList.add('active');
            
            // Если открыли чат, сбросить бейдж
            if (appName === 'chat') {
                document.getElementById('badge-chat').classList.add('hidden');
                // Если нет активного задания, триггерим начало или новое
                if (!state.activeJob && state.dealsCount < config.maxDeals) {
                    game.generateNextJob();
                }
            }
        }
    },
    
    back: () => {
        if (state.viewStack.length > 1 && !state.isPolice) {
            const currentId = state.viewStack.pop();
            const prevId = state.viewStack[state.viewStack.length - 1];
            
            document.getElementById(currentId).classList.remove('active');
            document.getElementById(prevId).classList.add('active');
        }
    },
    
    home: () => {
        if (!state.isPolice) {
            state.viewStack = ['view-home'];
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById('view-home').classList.add('active');
        }
    },

    openTransfer: (type) => {
        app.open('bank-transfer');
        const destInput = document.getElementById('t-dest');
        const amountInput = document.getElementById('t-amount');
        amountInput.value = '';

        if (state.activeJob && state.activeJob.step === 'send_bank') {
            destInput.value = state.activeJob.target;
        } else {
            destInput.value = "Нет активных реквизитов";
        }
    },

    openCryptoTrade: (type) => {
        app.open('crypto-action');
        document.getElementById('crypto-action-title').innerText = type === 'buy' ? 'P2P Покупка' : 'Вывод USDT';
        document.getElementById('c-amount').value = '';
        
        const instr = document.getElementById('crypto-instruction');
        if (type === 'buy' && state.activeJob && state.activeJob.step === 'buy_crypto') {
            instr.innerText = `Купить USDT на ${state.activeJob.amount} ₸`;
        } else if (type === 'send' && state.activeJob && state.activeJob.step === 'send_crypto') {
            instr.innerText = `Перевести на: ${state.activeJob.wallet}`;
        } else {
            instr.innerText = "Нет активных ордеров";
        }
        
        // Сохраняем тип действия в кнопку
        document.querySelector('.btn-main-crypto').dataset.type = type;
    }
};

// --- ИГРОВАЯ ЛОГИКА ---
const game = {
    init: () => {
        game.updateUI();
        // Первый хук через 2 секунды
        setTimeout(() => {
            game.notification("M-Chat", "Новое сообщение: Предложение работы", "chat");
        }, 2000);
    },

    // Генератор заданий (The Grind)
    generateNextJob: () => {
        const dealNum = state.dealsCount + 1;
        let job = {};

        // Прогрессия сложности
        if (dealNum === 1) {
            // Обучающая: Прими 20к -> Отправь 18к
            job = {
                type: 'classic',
                amountIn: 20000,
                keep: 2000,
                target: 'Айдос К. (Kaspi)',
                messages: [
                    "Салам. Есть тема. Примешь 20к, себе 2к, остальное скинешь другу?",
                    "Проверка связи так сказать."
                ]
            };
        } else if (dealNum < 5) {
            // Обычные переводы
            const amt = Math.floor(Math.random() * 5 + 2) * 10000; // 20k - 70k
            job = {
                type: 'classic',
                amountIn: amt,
                keep: amt * 0.1,
                target: `Дроп #${Math.floor(Math.random()*99)} (Kaspi)`,
                messages: [
                    "Работаем. Сейчас зайдет сумма.",
                    `Жди ${amt.toLocaleString()} ₸.`,
                    "Как придут - сразу переводи дальше."
                ]
            };
        } else {
            // Крипто схемы (сложнее)
            const amt = Math.floor(Math.random() * 10 + 5) * 10000; // 50k - 150k
            job = {
                type: 'crypto',
                amountIn: amt,
                keep: amt * 0.05, // 5%
                wallet: 'TX8s...jK9s (TRC20)',
                messages: [
                    "Новый ордер. P2P Арбитраж.",
                    `Заходит ${amt.toLocaleString()}.`,
                    "Покупаешь USDT на всё и кидаешь на кошелек."
                ]
            };
        }

        job.step = 'wait_start';
        state.activeJob = job;
        chat.renderIncoming(job.messages);
        
        // Добавляем кнопки выбора "Согласен"
        setTimeout(() => {
            chat.renderChoices([{ 
                text: "Принял. Жду поступления.", 
                action: () => {
                    chat.addMsg("Принял. Жду поступления.", 'out');
                    game.startJobFlow();
                }
            }]);
        }, 1500);
    },

    startJobFlow: () => {
        // Имитация зачисления денег через 3 сек
        setTimeout(() => {
            const incoming = state.activeJob.amountIn;
            state.money += incoming;
            game.addHistory(`Пополнение P2P`, incoming, 'plus');
            game.notification("K-Bank", `Поступление: +${incoming.toLocaleString()} ₸`, "bank");
            game.updateUI();
            
            // Инструкция от куратора
            setTimeout(() => {
                game.notification("M-Chat", "Деньги ушли. Работай.", "chat");
                if (state.activeJob.type === 'classic') {
                    state.activeJob.step = 'send_bank';
                    chat.renderIncoming([`Скидывай ${(incoming - state.activeJob.keep)} на: ${state.activeJob.target}`]);
                } else {
                    state.activeJob.step = 'buy_crypto';
                    chat.renderIncoming([`Закупай USDT на ${incoming} через P2P.`]);
                }
            }, 2000);
        }, 3000);
    },

    tryBankTransfer: () => {
        const amount = parseInt(document.getElementById('t-amount').value);
        if (!state.activeJob || state.activeJob.step !== 'send_bank') {
            alert("Нет активных поручений для перевода.");
            return;
        }
        
        const required = state.activeJob.amountIn - state.activeJob.keep;
        
        if (amount >= required) {
            // Успех
            state.money -= amount;
            game.addHistory(`Перевод: ${state.activeJob.target}`, amount, 'minus');
            game.finishJob();
            app.open('chat');
        } else {
            alert(`Нужно перевести минимум ${required}`);
        }
    },

    tryCryptoAction: () => {
        const type = document.querySelector('.btn-main-crypto').dataset.type;
        const val = document.getElementById('c-amount').value;
        
        if (type === 'buy' && state.activeJob.step === 'buy_crypto') {
            // Покупка
            state.money -= state.activeJob.amountIn;
            state.usdt += (state.activeJob.amountIn / 500); // курс 500
            game.addHistory('Binan-Z P2P Buy', state.activeJob.amountIn, 'minus');
            
            state.activeJob.step = 'send_crypto';
            game.updateUI();
            app.open('chat');
            chat.renderIncoming([`USDT вижу. Теперь вывод на кошелек: ${state.activeJob.wallet}`]);
            game.notification("M-Chat", "Новая инструкция", "chat");
            
        } else if (type === 'send' && state.activeJob.step === 'send_crypto') {
            // Отправка
            state.usdt = 0;
            game.finishJob();
            app.open('chat');
        } else {
            alert("Ошибка операции или неверный шаг.");
        }
    },

    finishJob: () => {
        state.activeJob = null;
        state.dealsCount++;
        game.updateUI();
        
        chat.renderIncoming(["Отлично. Сделка закрыта.", "Жди следующую."]);
        
        // ПРОВЕРКА НА ПОЛИЦИЮ
        if (state.dealsCount >= config.maxDeals) {
            setTimeout(game.triggerPoliceEnding, 4000);
        }
    },

    triggerPoliceEnding: () => {
        state.isPolice = true;
        // Звук вибрации
        if(navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
        
        // 1. Уведомление
        game.notification("SYSTEM", "⚠️ ВАШИ СЧЕТА ЗАБЛОКИРОВАНЫ", "police");
        
        // 2. Блокируем экран через 2 сек
        setTimeout(() => {
            app.open('police');
            document.getElementById('final-deals').innerText = state.dealsCount;
            // Прячем навигацию
            document.querySelector('.bottom-nav').style.display = 'none';
        }, 2000);
    },

    addHistory: (desc, amount, type) => {
        state.history.unshift({desc, amount, type});
        game.updateUI();
    },

    updateUI: () => {
        document.getElementById('bank-balance').innerText = state.money.toLocaleString() + ' ₸';
        document.getElementById('crypto-balance').innerText = state.usdt.toFixed(2) + ' USDT';
        
        const list = document.getElementById('bank-history');
        list.innerHTML = state.history.map(h => `
            <div class="h-item">
                <span>${h.desc}</span>
                <span class="${h.type}">${h.type==='plus'?'+':'-'}${h.amount.toLocaleString()} ₸</span>
            </div>
        `).join('');
    },

    notification: (title, text, type) => {
        const cont = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-bell"></i> <div><b>${title}</b><br>${text}</div>`;
        toast.onclick = () => app.open(type === 'police' ? 'home' : type);
        cont.appendChild(toast);
        
        if (type === 'chat') document.getElementById('badge-chat').classList.remove('hidden');
        
        setTimeout(() => toast.remove(), 4000);
    }
};

// --- ЧАТ ДВИЖОК ---
const chat = {
    renderIncoming: (messages) => {
        const feed = document.getElementById('chat-feed');
        messages.forEach((text, i) => {
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'msg in';
                div.innerText = text;
                feed.appendChild(div);
                feed.scrollTop = feed.scrollHeight;
            }, i * 1000);
        });
    },
    addMsg: (text, type) => {
        const feed = document.getElementById('chat-feed');
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        div.innerText = text;
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
        
        // Очистка кнопок
        document.getElementById('chat-actions').innerHTML = '';
    },
    renderChoices: (choices) => {
        const box = document.getElementById('chat-actions');
        box.innerHTML = '';
        choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = c.text;
            btn.onclick = c.action;
            box.appendChild(btn);
        });
    }
};

// Start
window.onload = game.init;
