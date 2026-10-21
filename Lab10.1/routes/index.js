var express = require('express');
var router = express.Router();

//########################################
//to process data sent in on request need body-parser module
var bodyParser = require('body-parser');
var path = require ('path'); //to work with separtors on any OS including Windows
var querystring = require('querystring'); //for use in GET Query string of form URI/path?name=value
var controllerDatabase = require('../controllers/database');

router.use(bodyParser.json()); // for parsing application/json

router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//#########################################

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ReadFormDataSaveMongoDB' });
});

//get first 10 customers
router.get('/customers', controllerDatabase.getFirst10Customers);

//get all customers
router.get(
  '/all-customers',
  controllerDatabase.getAllCustomers
);

// save the new customer
router.post("/saveNewCustomer", controllerDatabase.saveNewCustomer); //see controllers/database.js file

module.exports = router;
