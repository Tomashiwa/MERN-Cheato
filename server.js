const express = require("express");
const app = express();

const users = require("./routes/api/users");
const schools = require("./routes/api/schools");
const modules = require("./routes/api/modules");
const cheatsheets = require("./routes/api/cheatsheets");
const comments = require("./routes/api/comments");
const uploads = require("./routes/upload.router");

// Load body-parser middleware
app.use(express.json());

//Connect to URI of mongoDB's cluster
const mongoose = require('mongoose');
const dbURI = require("./config/keys").mongoURI;
mongoose.connect(
    dbURI,
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
app.use("/upload", uploads);

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