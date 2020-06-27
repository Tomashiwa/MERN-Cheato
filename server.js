const express = require("express");
const app = express();

const users = require("./routes/api/users");
const schools = require("./routes/api/schools");
const modules = require("./routes/api/modules");
const cheatsheets = require("./routes/api/cheatsheets");
const comments = require("./routes/api/comments");
const uploads = require("./routes/upload.router");
const auth = require("./routes/api/auth");

const School = require("./models/School");
const Module = require("./models/Module");

var modUpdateJob = require("./APIScheduler");

// Load body-parser middleware
app.use(express.json({limit: '50mb'}));

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