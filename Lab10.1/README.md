# Simple NodeJS+Express (ejs) code to read in new customer data and add to a MongoDB colleciton

This repository is a simple started code NodeJS+Express projet that has a / (index.js ->index.ejs view) which shows a simple form to gather data for a new customer
Here is what it looks like
![image](https://github.com/grewe/FormDataSaveMongoDB/assets/11790686/60014ccb-4dca-450b-83a0-495b3bc55152)


After entering in data and hitting "Go" the /saveNewCustomer route (index.js) is invoked as a POST request, this invokes the controller code
in controllers/database.js.   This will read in the POST form data of the customer's name and email and save this to a MongoDB Atlas database called
"shippingsite" in a collection called "customers".   The results will be that a new document with this name and email is added to the customers
collection.
![image](https://github.com/grewe/FormDataSaveMongoDB/assets/11790686/8d6cec36-4422-4d32-9856-b0398eb4fd80)

It will respond with a simple welcome to the new customer.

## IMPORTANT:  this is simple code  and it does not check if the customer email already exists --so it will stupidly create a new customer each
time regardless if it is the same information.  THIS should obviously be hanged
## IMPORTANT:  you will need to create your own databaseConnection.js file in the controllers directory that contains the following code

>module.exports = { uri: 'mongodb+srv://YOURLogin:YOURPassword@YOURClustername.WHATEVER.mongodb.net/?retryWrites=true&w=majority' };

