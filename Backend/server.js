require("dotenv").config();

const dbconnection = require("./src/config/db")
const emailconnection = require("./src/config/email")
const app = require('./src/app');
const PORT = process.env.PORT || 3000;

dbconnection;
emailconnection;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});