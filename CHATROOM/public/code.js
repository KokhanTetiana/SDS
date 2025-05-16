/**
 * Основна функція для ініціалізації чату.
 */
(function () {
    const app = document.querySelector(".app");
    const socket = io();

    /** @type {string|null} */
    let uname = null;

    window.addEventListener("DOMContentLoaded", () => {
        const savedName = localStorage.getItem("chatUsername");
        if (savedName) {
            uname = savedName;
            app.querySelector(".join-screen").classList.remove("active");
            app.querySelector(".chat-screen").classList.add("active");
            let messageContainer = app.querySelector(".chat-screen .messages");
            messageContainer.innerHTML = "";
            socket.emit("newuser", uname);
        }
    });

    app.querySelector(".join-screen #join-user").addEventListener("click", function () {
        let username = app.querySelector(".join-screen #username").value.trim();
        if (username.length === 0) {
            return;
        }
        socket.emit("newuser", username);
        uname = username;
        localStorage.setItem("chatUsername", uname);

        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");


    });

    app.querySelector(".chat-screen #send-message").addEventListener("click", function () {
        let message = app.querySelector(".chat-screen #message-input").value.trim();
        if (message.length === 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message
        });
        socket.emit("chat", {
            username: uname,
            text: message
        });
        app.querySelector(".chat-screen #message-input").value = "";
    });

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function () {
        socket.emit("exituser", uname);
        uname = null;
        localStorage.removeItem("chatUsername");
        app.querySelector(".chat-screen").classList.remove("active");
        app.querySelector(".join-screen").classList.add("active");
    });

    socket.on("update", function (update) {
        renderMessage("update", update);
    });

    socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    /**
     * Вивід повідомлення у вікно чату.
     * @param {"my" | "other" | "update"} type - Тип повідомлення.
     * @param {{username?: string, text?: string}} message - Об'єкт повідомлення.
     */
    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        if (type === "my") {
            let el = document.createElement("div");
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>`;
            messageContainer.appendChild(el);
        } else if (type === "other") {
            let el = document.createElement("div");
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>`;
            messageContainer.appendChild(el);
        } else if (type === "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();
