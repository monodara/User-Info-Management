//Load ExpressJS module
var express = require("express");
var bodyParser = require("body-parser");
var app = express(); 
// parse JSON and URL Encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// port the server app with listen on
var port = 8000; 

// watch for Ctrl-C and then close database connection!
process.on("SIGINT", function () {
  console.log("\nDatabase (mobilePhoneStore): Disconnected!\n");
  process.exit();
});

//connect MongoDB
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
// const assert = require('assert');
const connect = "mongodb+srv://admin:admin@cluster0.lciht.mongodb.net/myFirstDatabase?retryWrites=true&w=majority" // url from connect module
// const client = new MongoClient(connect, { useUnifiedTopology: true } );

// Set up Mongoose and our Database connection
const mongoose = require('mongoose');
mongoose.connect(connect);

// create a database in the collections
const dbName = 'mobilePhoneStore';

// Use connect method to connect to the server
MongoClient.connect(connect, { useUnifiedTopology: true }).then((client)=>{
  //use the database 'mobilePhoneStore'
  const db = client.db(dbName);
  const customersCollection = db.collection("customers");
  const phonesCollection = db.collection("phoneItems");
  const ordersCollection = db.collection("orders");
  console.log("Database (mobilePhoneStore): Connected!\n");
  app.get("/", function (req, res) {
    res.sendFile(__dirname + "/assignment-06.html");
  });

  //search a customer
  app.get("/api/phones/find", function (req, res) {
    // make the database query using the customer collection
    customersCollection
      .find(req.query)
      .toArray()
      .then((results) => {
        console.log(
          "Here is the results: \n\n" +
            JSON.stringify(results, null, 2) +
            "\n"
        );
        res.json(results); // return unprocessed result from MongoDB "find" Query
      })
      .catch((error) => console.error(error));
  });
  //search a phone
  app.get("/api/phones/find", function (req, res) {
    // make the database query using the phone collection
    phonesCollection
      .find(req.query)
      .toArray()
      .then((results) => {
        console.log(
          "Here is the results: \n\n" +
            JSON.stringify(results, null, 2) +
            "\n"
        );
        res.json(results); // return unprocessed result from MongoDB "find" Query
      })
      .catch((error) => console.error(error));
  });
  //search an order
  app.get("/api/orders/find", function (req, res) {
    // make the database query using the order collection
    ordersCollection
      .find(req.query)
      .toArray()
      .then((results) => {
        console.log(
          "Here is the results: \n\n" +
            JSON.stringify(results, null, 2) +
            "\n"
        );
        res.json(results); // return unprocessed result from MongoDB "find" Query
      })
      .catch((error) => console.error(error));
  });
  //Use POST request to create new records 
  //For customers and phone items, recorded can be created by input information;
  //For orders, first, find a customer by name; find a phone item by model, then create a new record according to the search result;
  //Insert record of customer
  app.post("/api/customer/create", function (req, res) {
    var userData = req.body;
    console.log(
      "USER DATA RECEIVED: \n\n" + JSON.stringify(userData, null, 2) + "\n"
    );
    customersCollection
      .insertOne(userData)
      .then((result) => {
        if(result.acknowledged){
          // respond to the user with confirmation message
          res.send(
            "User (" +
              userData.FirstName +
              " " +
              userData.Surname +
              ") data added to the Database!"
          );
        };
      })
      .catch((error) => console.error(error));    
  });
  //Insert record of phone item
  app.post("/api/phones/create", function (req, res) {
    var phoneData = req.body;
    console.log(
      "PHONE DATA RECEIVED: \n\n" + JSON.stringify(phoneData, null, 2) + "\n"
    );
    phonesCollection
      .insertOne(phoneData)
      .then((result) => {
        if(result.acknowledged){
          // respond to the user with confirmation message
          res.send(
            "Phone Model (" +
            phoneData.Manufacturer +
              " " +
              phoneData.Model +
              ") data added to the Database!"
          );
        };
      })
      .catch((error) => console.error(error));    
  });
  //Insert record of order
  //find a customer by name; then find a phone item by model; then form the order of the customer;
  app.post("/api/orders/create", function (req, res) {
    var customerQuery = {"FirstName" :req.query.FirstName};
    var phoneQuery = {"Model": req.query.Model};
    var orderNo = Math.floor(Math.random()*1000000000) + "P";
    customersCollection.findOne(customerQuery).then((result)=>{
      var customer = result;
      phonesCollection.findOne(phoneQuery).then((result)=>{
        var phoneModel = result;
        var orderData = {
          "orderNumber": orderNo,
          "customer": customer,
          "Phone": phoneModel
        };
        ordersCollection
          .insertOne(orderData)
          .then((result) => {
            if (result.acknowledged) {
              console.log("Order (" + orderNo + ", " +
              customer.FirstName +
              " " +
              customer.Surname + ", " + phoneModel.Model + ", " + phoneModel.Price +
              ") data added to the Database!");
              // respond to the user with confirmation message
              res.send(
                "Order (" + orderNo + ", " +
                customer.FirstName +
                " " +
                customer.Surname + ", " + phoneModel.Model + ", " + phoneModel.Price +
                ") data added to the Database!"
              );
            };
          })
      });
    })
    
    
      .catch((error) => console.error(error));    
  });
  //delete customer record
  app.delete("/api/customer", function (req, res) {
    var query = req.query;
    customersCollection
      .deleteOne(query)
      .then((result) => {
        if(result.deletedCount>0){
          console.log(
            `USER RECORD DELETED: ['${query.FirstName}','${query.Surname}','${query.Email}']\n`
          );
          res.send(
            "User (" +
            query.FirstName +
              " " +
              query.Surname +
              ") data deleted from the Database!"
          );
        }else{
          console.log("Deletion failed. No record found.");
          res.send("Deletion failed. No record found.")
        }
      })
      .catch((error) => console.error(error+"\nDeletion failed. No record found."));
  });
  //delete phone item
  app.delete("/api/phone", function (req, res) {
    var query = req.query;
    phonesCollection
      .deleteOne(query)
      .then((result) => {
        if(result.deletedCount>0){
          console.log(
            `PHONE RECORD DELETED: ['${query.Manufacturer}','${query.Model}','${query.Price}']\n`
          );
          res.send(
            "Phone Model (" +
            query.Manufacturer +
              " " +
              query.Model +
              ") data deleted from the Database!"
          );
        }else{
          console.log("Deletion failed. No record found.");
          res.send("Deletion failed. No record found.")
        }
      })
      .catch((error) => console.error(error));
  });
  //delete order
  app.delete("/api/order", function (req, res) {
    var query = req.query;
    ordersCollection
      .deleteOne(query)
      .then((result) => {
        if(result.deletedCount>0){
          console.log(
            `ORDER RECORD DELETED: ['${query.FirstName}','${query.orderNumber}']\n`
          );
          res.send(
            "Order (" +
            query.FirstName +
              " " +
              query.Model +
              ") data deleted from the Database!"
          );
        }else{
          console.log("Deletion failed. No record found.");
          res.send("Deletion failed. No record found.")
        }
      })
      .catch((error) => console.error(error));
  });
  //update customer record
  app.put("/api/customer", function (req, res) {
    var query = req.query;
    var newValue = {$set: req.body};
    customersCollection
      .updateOne(query, newValue)
      .then((result) => {
        if(result.matchedCount>0){
          console.log(
            `USER RECORD UPDATED: ['${query.FirstName}','${query.Surname}','${req.body.Email}']\n`
          );
          res.send(
            "User (" +
            query.FirstName +
              " " +
              query.Surname +
              ") data updated!"
          );
        }else{
          console.log("Updating failed. No record found.");
          res.send("Updating failed. No record found.")
        }
      })
      .catch((error) => console.error(error+"\nUpdating failed. No record found."));
  });
    //update phone record
    app.put("/api/phone", function (req, res) {
      var query = req.query;
      var newValue = {$set: req.body};
      phonesCollection
        .updateOne(query, newValue)
        .then((result) => {
          if(result.matchedCount>0){
            console.log(
              `USER RECORD UPDATED: ['${query.Manufacturer}','${query.Model}','${req.body.Price}']\n`
            );
            res.send(
              "Phone Model (" +
              query.Manufacturer +
                " " +
                query.Model +
                ") Price updated!"
            );
          }else{
            console.log("Updating failed. No record found.");
            res.send("Updating failed. No record found.")
          }
        })
        .catch((error) => console.error(error+"\nUpdating failed. No record found."));
    });
});

app.listen(port, () => {
  console.log("CS230 Assignment 06 - Yuanyuan Lu-21252534\n");
  console.log("Server running on port: " + port + "\n");
})

module.exports = app;

