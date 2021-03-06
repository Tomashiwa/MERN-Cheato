const sslRedirect = require('heroku-ssl-redirect');
const express = require("express");
const compression = require('compression')
const app = express();

const users = require("./routes/api/users");
const schools = require("./routes/api/schools");
const modules = require("./routes/api/modules");
const cheatsheets = require("./routes/api/cheatsheets");
const comments = require("./routes/api/comments");
const uploads = require("./routes/upload.router");
const auth = require("./routes/api/auth");
const similars = require("./routes/api/similars");
const suggestions = require("./routes/api/suggestions");

const School = require("./models/School");
const Module = require("./models/Module");

var modUpdateJob = require("./APIScheduler");

app.use(sslRedirect());
app.use(express.json({limit: '50mb'}));
app.use(compression());

//Connect to URI of mongoDB's cluster
const mongoose = require('mongoose');
const db = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? require("./config/keys").mongoURI
    : process.env.MONGO_URI;

mongoose.connect(
    db,
    {useNewUrlParser: true, useUnifiedTopology: true},
    () => console.log("Connected...")
);
mongoose.set("useCreateIndex", true);

//Use Routes
//Direct anything with path that goes /api/cheatsheets or /api/cheatsheets/... to cheatsheets.js
app.use("/api/users", users);
app.use("/api/schools", schools);
app.use("/api/modules", modules);
app.use("/api/cheatsheets", cheatsheets);
app.use("/api/comments", comments);
app.use("/api/auth", auth);
app.use("/api/similars", similars);
app.use("/api/suggestions", suggestions);
app.use("/upload", uploads);

app.get("/backend/schools/:name", (req, res) => {
    School.findOne({name: req.params.name})
        .then(school => res.status(200).json(school));
})

app.get("/backend/modules", (req, res) => {
    Module.find()
        .sort({name: -1})
        .then(modules => res.status(200).json(modules));
})

app.post("/backend/modules", (req, res) => {
    const newMods = req.body;
    Module.insertMany(newMods, (err, docs) => {
        res.status(200).json({newMods});        
    })
})

app.get("/ping", (req, res) => {
    res.status(200).send("Ping success!");
})

//Serve static assets (frontend stuff) if in production
const path = require("path");
if(process.env.NODE_ENV === "production") {
    //Set static folder
    app.use(express.static("client/build"));
    
    //Direct to the frontend index.html unless the request is hitting the backend's api
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    })
}

//Listen to port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));