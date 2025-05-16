const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const messagesFile = path.join(__dirname, "messages.json");
const setupSwagger = require("./swagger");
setupSwagger(app);

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Отримати останні 10 повідомлень
 *     responses:
 *       200:
 *         description: Список повідомлень
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     example: "user1"
 *                   text:
 *                     type: string
 *                     example: "Hello world"
 *       500:
 *         description: Помилка сервера при читанні повідомлень
 */
app.get("/messages", (req, res) => {
    fs.readFile(messagesFile, "utf8", (err, data) => {
        if (err) {
            console.error("Cannot read messages:", err);
            return res.status(500).json({ error: "Cannot read messages" });
        }
        let messages = [];
        try {
            messages = JSON.parse(data);
        } catch (parseErr) {
            console.error("Error parsing messages.json:", parseErr);
            return res.status(500).json({ error: "Corrupted messages data" });
        }
        res.json(messages.slice(-10));
    });
});

app.post("/message", (req, res) => {
    const newMessage = req.body;
    if (!newMessage.username || !newMessage.text) {
        return res.status(400).json({ error: "Invalid message format" });
    }

    fs.readFile(messagesFile, "utf8", (err, data) => {
        let messages = [];
        if (!err) {
            try {
                messages = JSON.parse(data);
            } catch {
                messages = [];
            }
        }

        messages.push(newMessage);

        fs.writeFile(messagesFile, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error("Failed to save message:", err);
                return res.status(500).json({ error: "Failed to save message" });
            }
            res.json({ success: true });
        });
    });
});

/**
 * @swagger
 * /clear-messages:
 *   post:
 *     summary: Очистити історію повідомлень
 *     responses:
 *       200:
 *         description: Історія повідомлень очищена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Помилка сервера при очищенні повідомлень
 */
app.post("/clear-messages", (req, res) => {
    console.log("Clear messages endpoint called");
    fs.writeFile(messagesFile, JSON.stringify([], null, 2), (err) => {
        if (err) {
            console.error("Error clearing messages:", err);
            return res.status(500).json({ error: "Failed to clear messages" });
        }
        io.emit("update", "Chat history was cleared by an admin.");
        res.json({ success: true });
    });
});

io.on("connection", (socket) => {
    socket.on("newuser", (username) => {
        socket.broadcast.emit("update", `${username} приєднався до розмови`);
    });

    socket.on("exituser", (username) => {
        socket.broadcast.emit("update", `${username} покинув розмову`);
    });

    socket.on("chat", (message) => {
        socket.broadcast.emit("chat", message);
        fetch("http://localhost:3000/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message)
        }).catch(err => console.error("Failed to save message", err));
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
