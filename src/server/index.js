// Setup empty JS object to act as endpoint for all routes
let projectData = {};

// Require Express to run server and routes
const express = require('express');

// Require cors
const cors = require("cors");

// Require body-parser
const bodyParser = require("body-parser");

// Start up an instance of app
const app = express();

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static('dist'));

// Set a port
const port = 3000;

// Setup Server
app.listen(port, () => console.log("Port number: " + port));

// GET & POST to get and post the data (projectData).
app.get('/all', function (req, res) {
    res.json(projectData);
});

app.post('/projectData', function (req, res) {
    projectData = req.body;
    res.json(projectData);
    console.log(projectData);
});
