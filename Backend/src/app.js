const express = require('express');
const path = require('path');
const app = express();
const userroutes = require("./routes/user.routes");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/test', express.static(path.join(__dirname, '../fr-test')));


app.use('/api', userroutes);


app.get('/', (req, res) => {
    res.send("hello world");
});

module.exports = app;