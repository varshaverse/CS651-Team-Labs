/**
 * Node.js + Express route file
 * Supports traditional HTML forms and REST/JSON requests.
 */

var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");

// Allows Express to read JSON requests from fetch()
router.use(bodyParser.json());

// Allows Express to read traditional HTML form data
router.use(bodyParser.urlencoded({ extended: true }));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Read Form Data"
  });
});

/*
 * 1. GET route parameter example

 * Example:
 * http://localhost:3000/read/Lynne
 */
router.get("/read/:name", function (req, res, next) {
  var value_name = req.params.name;

  res.json({
    message: "Request successful",
    data: value_name
  });
});

/*
 * 2. GET query-string example

 * Example:
 * http://localhost:3000/readNameAndRespond?name=Lynne
 */
router.get("/readNameAndRespond", function (req, res, next) {
  var value_name = req.query.name;

  res.send("Hello " + value_name);
});

/*
 * 3. Traditional POST form route

 * This route is from Lab N3.1.
 * It receives form data and returns an HTML response.
 */
router.post("/readCustomerInfoAndRespond", function (req, res, next) {
  var value_name = req.body.name;
  var value_email = req.body.email;

  res.send(
    "<h2>Traditional Form Response</h2>" +
    "<p>Welcome, " +
    value_name +
    "</p>" +
    "<p>We will reach you at: " +
    value_email +
    "</p>"
  );
});

/*
 * 4. Existing POST JSON example

 * This route reads the name from a POST request
 * and returns JSON.
 */
router.post("/readNameAndRespond", function (req, res, next) {
  var value_name = req.body.name;

  res.json({
    message: "Request successful",
    data: value_name
  });
});

/*
 * 5. New REST API route for Lab N3.2

 * JavaScript fetch() sends JSON to this route.
 */
router.post("/api/customer", function (req, res, next) {
  var value_name = req.body.name;
  var value_email = req.body.email;

  res.json({
    message: "Welcome " + value_name,
    email: value_email
  });
});

module.exports = router;