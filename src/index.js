const config = require("../config");
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const ws = require("./websocket");

const app = express();
app.locals.config = config;
app.locals.ws = ws;

app.set("env", process.env.NODE_ENV);
app.set("x-powered-by", false);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "..", "public"),
	{ maxAge: process.env.NODE_ENV === "production" ? 31536000000 : 0 }));

require("http").createServer(app).listen(config.sitePort);

app.get("*", (req, res) => {
	res.header("cache-control", "no-cache, no-store, must-revalidate");
	res.status(200).sendFile(path.resolve(__dirname, "..", "public", "app.html"));
});

process.on("unhandledRejection", err => {
	console.error(err.stack);
	process.exit(1);
});
