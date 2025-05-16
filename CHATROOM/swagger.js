const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chatroom API",
      version: "1.0.0",
      description: "Мінімальна документація для Chatroom API"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Локальний сервер"
      }
    ]
  },
  apis: ["./server.js"], // де описані маршрути
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
