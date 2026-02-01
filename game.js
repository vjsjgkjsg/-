const text = document.getElementById("text");
const choices = document.getElementById("choices");

function showText(content, callback) {
    text.innerHTML = "";
    let i = 0;
    const interval = setInterval(() => {
        text.innerHTML += content.charAt(i);
        i++;
        if (i >= content.length) {
            clearInterval(interval);
            if(callback) callback();
        }
    }, 15);
}

function showChoices(options) {
    choices.innerHTML = "";
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt.text;
        btn.onclick = opt.action;
        choices.appendChild(btn);
    });
}
