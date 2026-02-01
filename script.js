const OS = {
    state: {
        money: 1250,
        activeJob: null,
        jobStep: 0,
        dealsDone: 0,
        isCaught: false,
        openedApp: null,
        history: []
    },

    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
        
        // Первый контакт через 5 секунд
        setTimeout(() => {
            this.notify("M-Chat", "Менеджер: Привет. Есть работа.");
            document.getElementById('badge-mchat').style.display = 'block';
        }, 5000);
    },

    updateTime() {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        document.getElementById('current-time').innerText = timeStr;
        document.getElementById('big-time').innerText = timeStr;
    },

    openApp(appId) {
        if (this.state.isCaught) return;
        
        // Скрыть все приложения
        document.querySelectorAll('.app-window').forEach(el => el.classList.add('hidden'));
        document.getElementById('home-screen').classList.add('hidden');
        
        // Показать нужное
        const app = document.getElementById(`app-${appId}`);
        app.classList.remove('hidden');
        this.state.openedApp = appId;

        if (appId === 'mchat') {
            document.getElementById('badge-mchat').style.display = 'none';
            this.renderChat();
        }
        if (appId === 'kbank') this.updateBankUI();
    },

    goHome() {
        if (this.state.isCaught) return;
        document.querySelectorAll('.app-window').forEach(el => el.classList.add('hidden'));
        document.getElementById('home-screen').classList.remove('hidden');
        this.state.openedApp = null;
    },

    notify(title, text) {
        const center = document.getElementById('notif-center');
        const n = document.createElement('div');
        n.className = 'notif';
        n.innerHTML = `
            <div style="background:var(--kaspi); width:40px; height:40px; border-radius:10px; display:flex; justify-content:center; align-items:center; color:white">
                <i class="fas fa-bell"></i>
            </div>
            <div>
                <b style="font-size:14px">${title}</b>
                <p style="font-size:13px; color:#333">${text}</p>
            </div>
        `;
        n.onclick = () => this.openApp('mchat');
        center.appendChild(n);
        setTimeout(() => n.remove(), 5000);
    },

    // СИСТЕМА ЧАТА И КВЕСТОВ
    renderChat() {
        const container = document.getElementById('chat-messages');
        const footer = document.getElementById('chat-options');
        
        if (this.state.dealsDone === 0 && this.state.jobStep === 0) {
            this.addMsg("in", "Салам. Вижу, деньги нужны? Тема простая — транзит.");
            this.addMsg("in", "Принимаешь перевод на Каспи, перекидываешь на мой номер. 10% твои сразу.");
            
            footer.innerHTML = `
                <button class="opt-btn" onclick="OS.startQuest(1)">Давай попробуем</button>
                <button class="opt-btn" onclick="OS.goHome()">Я подумаю</button>
            `;
        }
    },

    addMsg(type, text) {
        const container = document.getElementById('chat-messages');
        const m = document.createElement('div');
        m.className = `msg ${type}`;
        m.innerText = text;
        container.appendChild(m);
        container.scrollTop = container.scrollHeight;
    },

    startQuest(id) {
        this.state.jobStep = 1;
        document.getElementById('chat-options').innerHTML = '';
        this.addMsg("out", "Давай попробуем. Что делать?");
        
        setTimeout(() => {
            this.addMsg("in", "Красавчик. Сейчас упадет 50 000 ₸.");
            this.addMsg("in", "Как придут — 45 000 ₸ кидай на +7 707 123 44 55 (Марат С.)");
            
            // Имитация прихода денег через 4 сек
            setTimeout(() => {
                this.state.money += 50000;
                this.state.history.unshift({type: 'plus', text: 'Пополнение P2P', amount: 50000});
                this.notify("K-Bank", "Пополнение: +50 000,00 ₸");
                this.state.activeJob = { target: "+77071234455", amount: 45000 };
            }, 4000);
        }, 1000);
    },

    // БАНКОВСКИЕ ОПЕРАЦИИ
    updateBankUI() {
        document.getElementById('kb-balance').innerText = this.state.money.toLocaleString() + " ₸";
        const hist = document.getElementById('kb-history');
        hist.innerHTML = '<h3>История</h3>' + this.state.history.map(h => `
            <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #ddd">
                <span>${h.text}</span>
                <b style="color:${h.type==='plus'?'green':'black'}">${h.type==='plus'?'+':'-'} ${h.amount} ₸</b>
            </div>
        `).join('');
    },

    showBankModal(type) {
        document.getElementById('bank-modal').classList.remove('hidden');
        if (this.state.activeJob) {
            document.getElementById('target-card').value = this.state.activeJob.target;
            document.getElementById('target-amount').value = this.state.activeJob.amount;
        }
    },

    closeBankModal() {
        document.getElementById('bank-modal').classList.add('hidden');
    },

    executeBankTransfer() {
        const amt = parseInt(document.getElementById('target-amount').value);
        if (this.state.money < amt) return alert("Недостаточно средств");

        this.state.money -= amt;
        this.state.history.unshift({type: 'minus', text: 'Перевод клиенту', amount: amt});
        this.state.dealsDone++;
        this.closeBankModal();
        this.updateBankUI();

        // Проверка: поймали или нет
        if (this.state.dealsDone >= 1) { // Для теста ловим сразу после первой
            this.triggerArrest();
        }
    },

    triggerArrest() {
        setTimeout(() => {
            this.state.isCaught = true;
            // Эффект помех
            document.getElementById('fx-overlay').style.background = "rgba(255,0,0,0.2)";
            
            setTimeout(() => {
                document.getElementById('app-kbank').innerHTML = `
                    <div style="padding:100px 20px; text-align:center; color:red">
                        <i class="fas fa-exclamation-triangle" style="font-size:50px"></i>
                        <h2>ОШИБКА ДОСТУПА</h2>
                        <p>Ваш аккаунт заблокирован по требованию правоохранительных органов.</p>
                    </div>
                `;
                
                setTimeout(() => {
                    document.getElementById('jail-screen').classList.remove('hidden');
                    document.getElementById('stat-money').innerText = "5 000";
                    document.getElementById('stat-deals').innerText = this.state.dealsDone;
                }, 3000);
            }, 1500);
        }, 2000);
    }
};

OS.init();
