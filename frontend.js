var mysql = require('mysql');
var readline = require('readline');
var rl = readline.createInterface(
  process.stdin, process.stdout);
const util = require('util');
const question = util.promisify(rl.question).bind(rl);
 
var http = require("http"); 
var url = require("url"); 
var querystring = require("querystring"); 
var fs = require("fs"); 
var port = 8080; 

var server = http.createServer(); 

var con = mysql.createConnection({
  host: "webcourse.cs.nuim.ie",
  user: "p220049",
  password: "IeYe6Ith5eiciec4",
  database: "cs230_p220049"
});

// watch for Ctrl-C and then close database connection!
process.on("SIGINT", function () {
    con.end(function (err) {
      if (err) {
        return console.log("error:" + err.message);
      }
      console.log("\nDatabase: Disconnected!");
      process.exit();
    });
  });
  
  //refer to John's demo code
  // listen for requests from clients
  server.on("request", function (request, response) {
    var currentRoute = url.format(request.url); // get the route (/ or /api/user)
    var currentMethod = request.method; // get the HTTP request type (POST - Create; GET - Retrieve)
    var requestBody = ""; // will contain the extracted POST data later
    // determine the route (/ or /api/user)
    switch (currentRoute) {
      // If no API call made then the default route is / so
      // just return the default index.html file to the user.
      // This contains the forms, etc. for making the CRUD
      case "/favicon.ico":
      case "/":
        fs.readFile(__dirname + "/assignment-04.html", function (err, data) {
          // get the file and add to data
          var headers = {
            // set the appropriate headers
            "Content-Type": "text/html",
          };
          response.writeHead(200, headers);
          response.end(data); // return the data (index.html)
        }); // as part of the response
        break;
      // Handle the requests from client made using the route /api/user
      // These come via AJAX embedded in the earlier served index.html
      // There will be a single route (/api/user) but two HTTP request methods
      // POST (for Create) and GET (for Retrieve)
      //
      case "/api/user":
        // Handle a POST request;  the user is sending user data via AJAX!
        // This is the CRUD (C)reate request. These data need to be
        // extracted from the POST request and saved to the database!
        if (currentMethod === "POST") {
          // read the body of the POST request
          request.on("data", function (chunk) {
            requestBody += chunk.toString();
          });
  
          // determine the POST request Content-type (and log to console)
          // Either: (i)  application/x-www-form-urlencoded or (ii) application/json
          const { headers } = request;
          let ctype = headers["content-type"];
          console.log("RECEIVED Content-Type: " + ctype + "\n");
  
          // finished reading the body of the request
          request.on("end", function () {
            var userData = "";
            // saving the user from the body to the database
            if (ctype.match(new RegExp("^application/x-www-form-urlencoded"))) {
              userData = querystring.parse(requestBody);
            } else {
              userData = JSON.parse(requestBody);
            }
            // log the user data to console
            console.log(
              "USER DATA RECEIVED: \n\n" +
                JSON.stringify(userData, null, 2) +
                "\n"
            );
            // we have the data supplied so make the database connection and
            // the (unvalidated) data. Without validation we just hope everything
            // works out okay - for production we would need to perform validation
            var sql = `INSERT INTO userTable (Title, FirstName, SurName, MobilePhone, Email, AddressLine1, AddressLine2,Town,CountyOrCity,Eircode,ShipAddressLine1, ShipAddressLine2, ShipTown, ShipCountyOrCity, ShipEircode) 
            values ("${userData.title}","${userData.firstname}","${userData.surname}","${userData.phone}","${userData.email}","${userData.add1}","${userData.add2}","${userData.city}","${userData.nation}","${userData.zip}","${userData.shipadd1}","${userData.shipadd2}","${userData.shipcity}","${userData.shipnation}","${userData.shipzip}");`;
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(
                `USER RECORD INSERTED: ['${userData.firstname}','${userData.surname}','${userData.email}']\n`
              );
              // respond to the user with confirmation message
              var headers = {
                "Content-Type": "text/plain",
              };
              // handle the responses here after the database query completes!
              response.writeHead(200, headers);
              response.end(
                "User (" +
                  userData.firstname +
                  " " +
                  userData.surname +
                  ") data added to the Database!"
              );
            });
          });
        }
  
        if (currentMethod === "DELETE") {
          // read the body of the POST request
          request.on("data", function (chunk) {
            requestBody += chunk.toString();
          });
  
          // determine the POST request Content-type (and log to console)
          // Either: (i)  application/x-www-form-urlencoded or (ii) application/json
          const { headers } = request;
          let ctype = headers["content-type"];
          console.log("RECEIVED Content-Type: " + ctype + "\n");
  
          // finished reading the body of the request
          request.on("end", function () {
            var userData = "";
            // saving the user from the body to the database
            if (ctype.match(new RegExp("^application/x-www-form-urlencoded"))) {
              userData = querystring.parse(requestBody);
            } else {
              userData = JSON.parse(requestBody);
            }
            // log the user data to console
            console.log(
              "USER DATA RECEIVED: \n\n" +
                JSON.stringify(userData, null, 2) +
                "\n"
            );
            // we have the data supplied so make the database connection and
            // the (unvalidated) data. Without validation we just hope everything
            // works out okay - for production we would need to perform validation
            var sql = `delete from userTable where (FirstName = '${userData.firstname}' OR SurName = '${userData.surname}') AND MobilePhone="${userData.phone}" AND Email="${userData.email}";`;
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(
                `USER RECORD DELETED: ['${userData.firstname}','${userData.surname}','${userData.email}']\n`
              );
              // respond to the user with confirmation message
              
              // handle the responses here after the database query completes!
              response.end(
                "User (" +
                  userData.firstname +
                  " " +
                  userData.surname +
                  ") data has been deleted!"
              );
            });
          });
        }
  
        // Handle a GET request;  the user is requesting user data via AJAX!
        // This is the CRUD (R)etrieve request. These data need to be
        // extracted from the database and returned to the user as JSON!
  
        if (currentMethod === "PUT") {
          // read the body of the POST request
          request.on("data", function (chunk) {
            requestBody += chunk.toString();
          });
  
          // determine the POST request Content-type (and log to console)
          // Either: (i)  application/x-www-form-urlencoded or (ii) application/json
          const { headers } = request;
          let ctype = headers["content-type"];
          console.log("RECEIVED Content-Type: " + ctype + "\n");
  
          // finished reading the body of the request
          request.on("end", function () {
            var userData = "";
            // saving the user from the body to the database
            if (ctype.match(new RegExp("^application/x-www-form-urlencoded"))) {
              userData = querystring.parse(requestBody);
            } else {
              userData = JSON.parse(requestBody);
            }
            // log the user data to console
            console.log(
              "USER DATA RECEIVED: \n\n" +
                JSON.stringify(userData, null, 2) +
                "\n"
            );
            // we have the data supplied so make the database connection and
            // the (unvalidated) data. Without validation we just hope everything
            // works out okay - for production we would need to perform validation
            var sql = `update userTable set Title="${userData.title}", MobilePhone="${userData.phone}", Email="${userData.email}", AddressLine1="${userData.add1}"
            where FirstName = '${userData.firstname}' AND SurName = '${userData.surname}';`;
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(
                `USER RECORD UPDATED: ['${userData.firstname}','${userData.surname}','${userData.email}']\n`
              );
              // respond to the user with confirmation message
              
              // handle the responses here after the database query completes!
              response.end(
                "User (" +
                  userData.firstname +
                  " " +
                  userData.surname +
                  ") data has been updated!"
              );
            });
          });
        }
        else if (currentMethod === "GET") {
          request.on("data", function (chunk) {
            requestBody += chunk.toString();
          });
  
          
          request.on("end", function () {
            var userData = "";
            userData = JSON.parse(requestBody);
            // log the user data to console
            console.log(
              "USER DATA RECEIVED: \n\n" +
                JSON.stringify(userData, null, 2) +
                "\n"
            );
            // we have the data supplied so make the database connection and
            // the (unvalidated) data. Without validation we just hope everything
            // works out okay - for production we would need to perform validation
            var sql = `SELECT * FROM userTable where FirstName like "%${userData.firstname}%" OR SurName like "%${userData.firstname}%"`;
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(
                "USER DATABASE REQUESTED: \n\n" +
                  JSON.stringify(result, null, 2) +
                  "\n"
              );
              // handle the responses here after the database query completes!
              response.writeHead(200, headers);
              response.end(JSON.stringify(result)); // return result from SQL Query
            });
          });
          // make the database query using the connection created earlier
          
        }
        break;
  
        default: 
        if (currentMethod === "POST") {
  
          // read the body of the POST request
          request.on("data", function (chunk) {
            requestBody += chunk.toString();
          });
          // const { headers } = request;
          // let ctype = headers["content-type"];
          // console.log("RECEIVED Content-Type: " + ctype + "\n");
          
          request.on("end", function () {
            var userData = "";
  
            userData = JSON.parse(requestBody);          
            // log the user data to console
            console.log(
              "USER DATA RECEIVED: \n\n" +
                JSON.stringify(userData, null, 2) +
                "\n"
            );
            // we have the data supplied so make the database connection and
            // the (unvalidated) data. Without validation we just hope everything
            // works out okay - for production we would need to perform validation
            var sql = `SELECT * FROM userTable where FirstName like "%${userData.firstname}%" OR SurName like "%${userData.firstname}%"`;
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(
                "USER DATABASE REQUESTED: \n\n" +
                  JSON.stringify(result, null, 2) +
                  "\n"
              );
              // handle the responses here after the database query completes!
              response.writeHead(200, headers);
              response.end(JSON.stringify(result, null, 2)); // return result from SQL Query
            });
          });
        }
  
        // Handle a GET request;  the user is requesting user data via AJAX!
        // This is the CRUD (R)etrieve request. These data need to be
        // extracted from the database and returned to the user as JSON!
        else if (currentMethod === "GET") {
          request.on("data", function (chunk) {
            requestBody += chunk.toString();
          });
          request.on("end", function () {
            var searchName = currentRoute.split("=")[1]
            // we have the data supplied so make the database connection and
            // the (unvalidated) data. Without validation we just hope everything
            // works out okay - for production we would need to perform validation
            var sql = `SELECT * FROM userTable where FirstName like "%${searchName}%" OR SurName like "%${searchName}%"`;
            
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(
                "USER DATABASE REQUESTED: \n\n" +
                  JSON.stringify(result, null, 2) +
                  "\n"
              );
              // handle the responses here after the database query completes!
              // response.writeHead(200, headers);
              response.end(JSON.stringify(result)); // return result from SQL Query
            });
          });
          // make the database query using the connection created earlier
          
        }
        break;
    }
  });
  
  // Set up the HTTP server and listen on port 8000
  server.listen(port, function () {
    console.log("\nUser Info Management");
    console.log("AJAX (HTTP) API server running on port: " + port + "\n");
  });
con.connect(function(err) {
  if (err) throw err;
  
  //create table;
  var sqlDropTable = 
  //validate	data	on	the	Title	field
  `Drop table if exists userTable;`;
  con.query(sqlDropTable, function (err, result) {
    if (err) throw err;
  });
  //create table;
  var sqlCreateTable = 
  //validate	data	on	the	Title	field
  `CREATE TABLE userTable(Title VARCHAR(10),FirstName VARCHAR(255) NOT NULL,SurName VARCHAR(255) NOT NULL, MobilePhone VARCHAR(14) NOT NULL, Email VARCHAR(50) NOT NULL, AddressLine1 VARCHAR(50) NOT NULL, AddressLine2 VARCHAR(50), Town VARCHAR(50) NOT NULL, CountyOrCity VARCHAR(50) NOT NULL, Eircode VARCHAR(50),
  ShipAddressLine1 VARCHAR(50) NOT NULL, ShipAddressLine2 VARCHAR(50), ShipTown VARCHAR(50) NOT NULL, ShipCountyOrCity VARCHAR(50) NOT NULL, ShipEircode VARCHAR(50),
  CONSTRAINT CHK_Title CHECK (Title in ('Mx','Ms','Mr','Mrs','Miss','Dr','Other','')));`;
  con.query(sqlCreateTable, function (err, result) {
    if (err) throw err;
  });
  //insert 20 users data;
  for(var i=0;i<20;i++){
    var fname = getRandomFirstName();
    var sname = getRandomSurName();

    var sqlInsertData = 
    "INSERT INTO userTable (Title, FirstName, SurName, MobilePhone, Email, AddressLine1, AddressLine2,Town,CountyOrCity,Eircode,ShipAddressLine1, ShipAddressLine2, ShipTown, ShipCountyOrCity, ShipEircode) "
     + "values (\'"+titleGenerator()+"\',\'" + fname +"\',\'" + sname +"\',\'" +phoneNumberGenerator()+"\',\'"+fname+"@gmail.com" +"\',\'"+address1Generator()+"\',\'"+"MU"+"\',\'"+"Maynooth"+"\',\'"+"Ireland"+"\',"+null+",\'"+address1Generator()+"\',\'"+"MU"+"\',\'"+"Maynooth"+"\',\'"+"Ireland"+"\',"+null +");";
    console.log(sqlInsertData)
     con.query(sqlInsertData, function (err, result) {
      if (err) throw err;
    });
  }
  console.log("20 users' information has initially been stored.\n \n");
  manipulate().then(()=>{
    console.log("Thank you!")
  });
});
var sql;
async function manipulate(){
  while(sql !== "exit"){
    sql = await getSQL();
    if(sql !== "exit")
    // 
    await output(sql);
  }
}
async function output(sql){
  con.query(sql, function (err, result) {
    var str = sql;
    if(str.indexOf("select")>=0)
    console.log(result);
    if(str.indexOf("INSERT")>=0)
    console.log("Successfully Insert!");
    if (err) throw err;
  });
}
async function getSQL(){
  var input = await question("What do you want to do next? Please entre a letter.\nC for create a new record;\nR for search;\nU for update;\nD for delete.\nE for exit.\n")
  var sql;
  if(input === "R" | input === "r"){
    //search users 
    sql = await getSelectSQL();
  }else if(input === "U" | input === "u"){
    //update user information
    sql = await getUpdateSQL();
  }else if(input === "D" | input === "d"){
    //delete a record
    sql = await getDeleteSQL();
  }else if(input === "C" | input === "c"){
    //insert a new piece a record
    sql = await getInsertSQL();
  }else if(input === "E" | input === "e"){
    return "exit";
  }else{
    console.log("Sorry it's not a valid operator command. Please try again.")
    getSQL();
  }
  return sql;
}

var updateName;
var phoneNumber;
var email;
var title;
var address1;
var address2;
var townName;
var countryName;
var eircode;
async function getInsertSQL() {
  try {
    var firstname = await question('Please enter the first name of the user:*  '); 
    var surname = await question('Please enter the surname of the user:*  '); 
    phoneNumber = await question('Please enter the mobile phone number:*  ');
    email = await question('Please enter the email address:*  ');
    title = await question('Please enter the title. (It should be Mx, Ms, Mr, Mrs, Miss, Dr or Other.)  ');
    address1 = await question('Please enter the address line 1:*  ');
    address2 = await question('Please enter the address line 2:  ');
    townName = await question('Please enter the town name:*  ');
    countryName = await question('Please enter the country name:*  ');
    eircode = await question('Please enter the eircode:  ');
    var insertSQL =  await insertSQLgenerator(firstname,surname,address1,address2,townName,countryName,eircode,phoneNumber,email,title);
    return insertSQL;
  } catch (err) {
    console.error('Question rejected', err);
  }
}
async function getUpdateSQL() {
  try {
    updateName = await question('Please enter the name of the user you want to update:  '); 
    phoneNumber = await question('Please enter the new mobile phone number:  ');
    email = await question('Please enter the new email address:  ');
    title = await question('Please enter the new title. (It should be Mx, Ms, Mr, Mrs, Miss, Dr or Other.)  ');
    address1 = await question('Please enter the new address.  ');
    var updateSQL =  await updateSQLgenerator(title,phoneNumber,email,updateName,address1);
    return updateSQL;
  } catch (err) {
    console.error('Question rejected', err);
  }
}

async function getDeleteSQL() {
  try {
    updateName = await question('Please enter the name of the user you want to delete:  '); 
    phoneNumber = await question('Please enter the phone number of the user you want to delete:  ');
    email = await question('Please enter the email of the user you want to delete:  ');
    var deleteSQL =  await deleteSQLgenerator(phoneNumber,email,updateName);
    return deleteSQL;
  } catch (err) {
    console.error('Question rejected', err);
  }
}
async function getSelectSQL() {
  try {
    updateName = await question('Please enter the name of the user you want to search:  '); 
    var selectSQL =  await selectSQLgenerator(updateName);
    return selectSQL;
  } catch (err) {
    console.error('Question rejected', err);
  }
}

updateSQLgenerator = (title,phoneNumber,email,name,address1)=>{
  return `update userTable set Title="${title}", MobilePhone="${phoneNumber}", Email="${email}", AddressLine1="${address1}"
  where FirstName like '%${name}%' OR SurName like '%${name}%';`;
}
selectSQLgenerator = (name)=>{
  return `select * from userTable where FirstName like '%${name}%' OR SurName like '%${name}%';`;
}
deleteSQLgenerator = (phoneNumber,email,name)=>{
  return `delete from userTable where (FirstName = '${name}' OR SurName = '${name}') AND MobilePhone="${phoneNumber}" AND Email="${email}";`;
}
insertSQLgenerator = (fname,sname,add1,add2,town,county,ecode,phoneNumber,email,title)=>{
  return `INSERT INTO userTable (Title, FirstName, SurName, MobilePhone, Email, AddressLine1, AddressLine2,Town,CountyOrCity,Eircode,ShipAddressLine1, ShipAddressLine2, ShipTown, ShipCountyOrCity, ShipEircode) 
  values ("${title}","${fname}","${sname}","${phoneNumber}","${email}","${add1}","${add2}","${town}","${county}","${ecode}","${add1}","${add2}","${town}","${county}","${ecode}");`;
}



var titles = ['Mx',	'Ms',	'Mr',	'Mrs',	'Miss',	'Dr',	'Other'];
function titleGenerator(){
  var index = Math.floor(Math.random() * 7);
  return titles[index];
}
function phoneNumberGenerator(){
  var number = "+";
  for(var i=0;i<13;i++){
    number += Math.floor(Math.random() * 10);
  }
  return number;
}
var addressLine1 = ["Juniper","Ash","Adar","Cedar","Maple","Howth","Berry"];
function address1Generator(){
  var index = Math.floor(Math.random() * 7);
  return "Building "+addressLine1[index];
}

//refer to John's name generator
        // CSO Baby Names of Ireland (https://www.cso.ie/en/interactivezone/visualisationtools/babynamesofireland/)
        var bNames = 
        `Conor
        Daniel
        Adam
        Liam
        Tadhg
        Luke
        Charlie
        Darragh
        Harry
        Oisín
        Michael
        Alex
        Fionn
        Cillian
        Thomas
        Jamie
        Patrick
        Rían
        Finn
        Seán
        Oliver
        Ryan
        Dylan
        Matthew
        Ben
        Bobby
        John
        Leo
        Cian
        Aaron
        Max
        Ethan
        Alexander
        Jake
        Tom
        Jacob
        Alfie
        David
        Senan
        Oscar
        Sam
        Callum
        Mason
        Ollie
        Aidan
        Theo
        William
        Leon
        Joseph
        Tommy
        Joshua
        Lucas
        Evan
        Donnacha
        Logan
        Luca
        Samuel
        Nathan
        Cathal
        Shay
        Archie
        Jayden
        George
        Kai
        Andrew
        Louis
        Danny
        Rory
        Theodore
        Freddie
        Eoin
        Benjamin
        Billy
        Hugo
        Muhammad
        Ronan
        Robert
        Arthur
        Kayden
        Christopher
        Henry
        Frankie
        Dara
        Kyle
        Ruairí
        Edward
        Isaac
        Martin
        Odhran
        Eli
        Mark
        Anthony
        Josh
        Zach
        Joey
        Odhrán
        Kevin
        Tadgh
        Jaxon
        Scott
        Sonny
        Tomás
        Cormac
        Peter
        Sean
        Eoghan
        Brody
        Shane
        Killian
        Tiernan
        Sebastian
        Carter
        Hunter
        Daithí
        Ciarán
        Rian
        Teddy
        Tyler
        Arlo
        Gabriel
        Jackson
        Eric
        Cody
        Éanna
        Lorcan
        Alan
        Filip
        Joe
        Elliot
        Rhys
        Oran
        Calvin
        Nicholas
        Blake
        Harrison
        Paddy
        Brian
        Caleb
        Louie
        Harvey
        Cole
        Páidí
        Séan
        Reuben
        Denis
        Ted
        Iarlaith
        Jason
        Donagh
        Elliott
        Riley
        Iarla
        Lewis
        Jordan
        Antoni
        Elijah
        Cooper
        Paul
        Hugh
        Rowan
        Daire
        Gerard
        Keelan
        Kian
        Jonathan
        Jude
        Lukas
        Jakub
        Zack
        Johnny
        Stephen
        Niall
        Charles
        Felix
        Levi
        Bradley
        Fiachra
        Conn
        Zac
        Cameron
        Kacper
        Milo
        Dáire
        Dáithí
        Robbie
        Olly
        Caolán
        Owen
        Corey
        Oskar
        Conall
        Jan
        Jonah
        Robin
        Mateo
        Adrian
        Shea
        Toby
        Diarmuid
        Myles
        Leonardo
        Ned
        Grayson
        Séamus
        Dean
        Jesse
        Zachary
        Dominic
        Pádraig
        Ruadhán
        Colm
        Richard
        Philip
        Frank
        Will
        Dan
        Christian
        Keegan
        Matteo
        Aodhán
        Gearóid
        Reece
        Marcel
        Franciszek
        Parker
        Ian
        Noel
        Conan
        Rocco
        Aleksander
        Darius
        Casey
        Jaxson
        Kieran
        Timothy
        Naoise
        Peadar
        Matei
        Kaiden
        Fíonn
        Ross
        Colin
        Lennon
        Emmet
        Luka
        Ali
        Mikey
        Maximilian
        Aiden
        Damian
        Art
        Harley
        Finley
        Daragh
        Connor
        Dominik
        Austin
        Caelan
        Jimmy
        Flynn
        Hudson
        Cían
        Mícheál
        Tiarnán
        Calum
        Lee
        Tristan
        Marcus
        Donal
        Donncha
        Bernard
        Lochlann
        Maksymilian
        Stefan
        Nathaniel
        Julian
        Cayden
        Beau
        Elias
        Lachlan
        Ezra
        Gavin
        Seamus
        Brendan
        Szymon
        Vincent
        Francis
        Ruben
        Ibrahim
        Tobias
        Faolán
        Brandon
        Darren
        Simon
        Jay
        Caolan
        Hayden
        Victor
        Mikolaj
        Alexandru
        Mohamed
        Andrei
        Andy
        Caiden
        Jace
        Cuán
        Eóin
        Micheál
        Oisin
        Justin
        Brooklyn
        Kealan
        Frederick
        Seth
        Dawson
        Lochlan
        Odin
        Beauden
        Barry
        Maxim
        Jim
        Roman
        Ahmad
        Luan
        Bruno
        Ralph
        Tymon
        Jasper
        Enzo
        Miles
        Rua
        Ewan
        Ivan
        Troy
        Pearse
        Ferdia
        Jeremiah
        Wiktor
        Diego
        Artur
        Olaf
        Leighton
        Lorenzo
        Culann
        Jayce
        Otis
        Eóghan
        Sé
        Dawid
        Morgan
        Mohammad
        Tony
        Nikodem
        Mohammed
        Nicolas
        Cuan
        Malachy
        Caden
        Rafael
        Ellis
        Alec
        Barra
        Paudie
        Lenny
        Reggie
        Shéa
        Tomas
        Dillon
        Declan
        Kane
        Ashton
        Donnchadh
        Bill
        Albert
        Fabian
        Cristian
        Ayaan
        Quinn
        Brayden
        Kyron
        Tommie
        Tymoteusz
        Ayan
        Brogan
        Carson
        Mylo
        Omar
        Spencer
        Zain
        Nico
        Zion
        Ignacy
        Ruadh
        Gael
        Cúan
        Dónal
        Seán Óg
        Séimí
        Padraig
        Patryk
        Mateusz
        Gary
        Euan
        Olan
        Marco
        Ultan
        Natan
        Oliwier
        Chris
        Piotr
        Tomasz
        Benas
        Eryk
        Domhnall
        Thady
        Axel
        Emanuel
        Rohan
        Asher
        Fiach
        Ailbe
        Bodhi
        Brodie
        Zayn
        Bogdan
        Hamish
        Matias
        Remy
        River
        Albie
        Caoimhín
        Kyren
        Lorcán
        Ódhran
        Micheal
        Tiarnan
        Michal
        Davin
        Jeremy
        Kajus
        Hubert
        Hamza
        Pedro
        Leonard
        Ajay
        Matt
        Maximus
        Raphael
        Syed
        Eduard
        Milan
        Rio
        Wyatt
        Emmett
        Freddy
        Tajus
        Yusuf
        Jenson
        Kody
        Teodor
        Óisín
        Senán
        Steven
        Damien
        Eamon
        Neil
        Eamonn
        Joel
        Roan
        Ahmed
        Laurence
        Warren
        Erik
        Karol
        Pauric
        Emil
        Mike
        Miguel
        Rayan
        Abdul
        Dennis
        Jonas
        Terence
        Cain
        Kristian
        Kyran
        Marko
        Eden
        Kaylum
        Lochlainn
        Lucca
        Braxton
        Arijus
        Karson
        Rayyan
        Avery
        Kayson
        Croí
        Fionán
        Pádraic
        Séadna
        Ace
        Ciaran
        Ruairi
        Marc
        Riain
        Emmanuel
        Travis
        Raymond
        Bartosz
        Bailey
        Glenn
        Jerry
        Aron
        Gregory
        Turlough
        Abel
        Eddie
        Krzysztof
        Xavier
        Wojciech
        Markus
        Regan
        Ricky
        Amir
        Kylan
        Luis
        Mustafa
        Nataniel
        Viktor
        Malik
        Rion
        Walter
        Zane
        Aronas
        Alessio
        Darach
        Heath
        Koby
        Mannix
        Markas
        Phoenix
        Rares
        Cruz
        Iosua
        John-Paul
        Marley
        Seamie
        Vlad
        Jordi
        Koa
        Olivers
        Lugh
        Mj
        Fionnán
        Maitiú
        Ólan
        Ultán
        Seanán
        Oakley
        Daithi
        Karl
        Bryan
        Pierce
        Kamil
        Olivier
        Mathew
        Conal
        Zak
        Aran
        Nikita
        Preston
        Roy
        Igor
        Devin
        Mario
        Abdullah
        Andre
        Feidhlim
        Maksim
        Nojus
        Devon
        Gerry
        Maurice
        Stanislaw
        Byron
        Cal
        Dominick
        Dominykas
        Aryan
        Callan
        Christy
        Con
        Cullen
        Danielius
        Fred
        Hassan
        Kaleb
        Kalvin
        Anas
        Beniamin
        Ephraim
        Ruan
        Timmy
        Alistair
        Erick
        Abraham
        Bobbie
        Bruce
        Coby
        Davi
        Dorian
        Evanas
        Haris
        Hughie
        Macdara
        Miley
        Moise
        Nikolas
        Richie
        Benny
        Constantin
        Dalton
        Herkus
        Iarfhlaith
        Kenny
        Kobi
        Kylian
        Musa
        Noa
        Timas
        Tudor
        Rico
        Karter
        Ari
        Henryk
        Zayan
        Kaiser
        Kit
        Páraic
        Rónán
        Jax
        Craig
        Shaun
        Matas
        Clayton
        Kenneth
        Tim
        Saul
        Daryl
        Gareth
        Maxwell
        Seanan
        Cailum
        Larry
        Emilis
        Jody
        Keenan
        Aedan
        Allan
        Fynn
        Jaiden
        Raul
        Alfred
        Angelo
        Cahir
        Chulainn
        Culainn
        Giovanni
        Guy
        Jia
        Kajetan
        Lincoln
        Milosz
        Orin
        Pavel
        Quin
        Zayd
        Barney
        Borys
        Dexter
        Ezekiel
        Franklin
        Aarav
        Aodh
        Kasper
        Ksawery
        Layton
        Rodrigo
        Rogan
        Sonnie
        Tommy Lee
        Tommy-Lee
        Youssef
        Zaid
        Zakaria
        Azlan
        Caolin
        Dario
        Eyad
        Gabriels
        Gene
        Idris
        Ishaan
        Jj
        Jonathon
        Kevins
        Lughaidh
        Mathias
        Mohamad
        Santiago
        Setanta
        Timur
        Valentin
        Vladimir
        Yahya
        Yaseen
        Coen
        Denver
        Mieszko
        Vihaan
        Alby
        Colby
        Damir
        Thiago
        Tyson
        Yousuf
        Clark
        Donnie
        Cobi
        Jakov
        Kiaan
        Advik
        Aodán
        Azaan
        Bernardo
        Bradán
        Cadán
        Clay
        Óran
        Rónan
        Ruán
        Seánie
        Sunny
        Théo
        Ruaidhrí
        Lawson
        Kaison
        Laoch
        Yazan
        Orán
        Pádhraic
        T J
        Teidí
        Cúán
        Denny
        Benett
        Aris
        Boston
        Brín
        Glen
        Enda
        Aodhan
        Fintan
        Padraic
        Desmond
        Finlay
        Rossa
        Antonio
        Zachariah
        Diarmaid
        Kilian
        Dion
        Finian
        Kornel
        Marcos
        Trevor
        Terry
        Carlos
        Damon
        Jared
        Kaden
        Malachi
        Russell
        Sami
        Solomon
        Wesley
        Aleks
        Anton
        Dwayne
        Enrico
        Erikas
        Felim
        Gabrielius
        Jarlath
        Jerome
        Kallum
        Lennox
        Roberto
        Rui
        Samson
        Taha
        Cohen
        Don
        Geordan
        Isaiah
        Johan
        Jon
        Kade
        Keagan
        Kurt
        Manus
        Micah
        Remi
        Roger
        Theodor
        Tiago
        Torin
        Xander
        Alejandro
        Aleksandr
        Amos
        Blaise
        Caine
        Dante
        Elvis
        Eunan
        Harris
        Jakob
        Jamal
        Joris
        Adomas
        Aj
        Arjun
        Artem
        Asa
        Ashley
        Bowie
        Casper
        Colton
        Cuinn
        Denas
        Domas
        Douglas
        Fletcher
        Franek
        Jensen
        Korey
        Lucian
        Malcolm
        Matej
        Neitas
        Nolan
        Rex
        Rylan
        Rylee
        Safwan
        Sebastien
        Steve
        Teo
        Tobiasz
        Umar
        Antony
        Arnold
        Augustas
        Ayman
        Cezary
        Connie
        Darby
        Dhruv
        Dominiks
        Donald
        Finbar
        Isac
        Israel
        Jozef
        Kaelan
        Kenzo
        Kodi
        Lleyton
        Marius
        Matheus
        Mihai
        Miracle
        Quentin
        Reginald
        Reid
        Roland
        Sameer
        Sidney
        T.J.
            Timotei
        Usman
        Yassin
        Ammar
        Archer
        Axl
        Breffni
        Arham
        Kobe
        Rob
        Sawyer
        Affan
        Jad
        Judah
        Kason
        Ziggy
        Bryson
        Cade
        Cillían
        Conán
        Éamonn
        Reyansh
        Rí
        Ríain
        Rohaan
        Younis
        Llewyn
        Malek
        Séadhna
        Seb
        Reign
        Reon
        Knox
        Vincenzo
        Rián
        Magnus
        Ríoghan
        Ronán
        Klayton
        Mikaeel
        Samy
        C J
        Alonzo
        Cónán
        Daimhín
        Evaan
        Feidhelm
        Féilim
        Beckett
        Bríon
        Afonso
        Forrest
        Eliezer
        Dómhnall
        Jem
        Casian`.split(/\n/);

        // CSO Baby Names of Ireland (https://www.cso.ie/en/interactivezone/visualisationtools/babynamesofireland/)
        var gNames = 
        `Emily
        Grace
        Fiadh
        Sophie
        Hannah
        Amelia
        Ava
        Ellie
        Ella
        Mia
        Lucy
        Emma
        Lily
        Olivia
        Chloe
        Aoife
        Caoimhe
        Molly
        Anna
        Sophia
        Holly
        Freya
        Saoirse
        Kate
        Sadie
        Robyn
        Katie
        Ruby
        Evie
        Éabha
        Cara
        Sarah
        Isabelle
        Isla
        Alice
        Leah
        Sadhbh
        Eva
        Erin
        Róisín
        Zoe
        Sofia
        Zara
        Willow
        Charlotte
        Lauren
        Jessica
        Faye
        Ciara
        Clodagh
        Millie
        Isabella
        Eve
        Niamh
        Maya
        Layla
        Ada
        Rosie
        Abigail
        Julia
        Clara
        Maisie
        Amy
        Maria
        Aria
        Alannah
        Annie
        Harper
        Aoibhín
        Emilia
        Amber
        Bonnie
        Mila
        Heidi
        Ailbhe
        Bella
        Abbie
        Ivy
        Aoibheann
        Rose
        Sienna
        Elizabeth
        Georgia
        Rebecca
        Laura
        Ellen
        Méabh
        Alexandra
        Kayla
        Isabel
        Hollie
        Mary
        Áine
        Aisling
        Hazel
        Rachel
        Tara
        Evelyn
        Megan
        Doireann
        Daisy
        Hanna
        Lara
        Mollie
        Maeve
        Sara
        Lilly
        Luna
        Victoria
        Hailey
        Hayley
        Poppy
        Fíadh
        Zoey
        Penny
        Pippa
        Ayla
        Ayda
        Nina
        Annabelle
        Penelope
        Indie
        Alanna
        Maja
        Paige
        Lola
        Naoise
        Cora
        Matilda
        Elsie
        Laoise
        Nora
        Lexi
        Eleanor
        Hallie
        Lottie
        Aoibhe
        Ruth
        Lena
        Phoebe
        Nicole
        Eimear
        Jane
        Síofra
        Siún
        Brooke
        Mya
        Gracie
        Summer
        Tess
        Eliza
        Caitlin
        Alison
        Darcie
        Esmé
        Madison
        Lucia
        Maggie
        Callie
        Muireann
        Beth
        Kathleen
        Tessa
        Croía
        Aoibhinn
        Jasmine
        Isobel
        Juliette
        Savannah
        Riley
        Caragh
        Kara
        Stella
        Liliana
        Ariana
        Florence
        Darcy
        Esme
        Ríona
        Zuzanna
        Bridget
        Nadia
        Gabriela
        Aurora
        Éala
        Róise
        Kayleigh
        Cassie
        Elena
        Anastasia
        Nevaeh
        Alicia
        Aaliyah
        Allie
        Scarlett
        Naomi
        Margaret
        Maia
        Elise
        Farrah
        Katelyn
        Shauna
        Orla
        Aimee
        Vanessa
        Alana
        Natalia
        Rhea
        Skye
        April
        Alicja
        Nancy
        Mae
        Arabella
        Keeva
        Aoibh
        Robin
        Pearl
        Eden
        Remi
        Taylor
        Alisha
        Catherine
        Casey
        Nessa
        Lacey
        Thea
        Iris
        Maddison
        Tilly
        Bláithín
        Lydia
        Zofia
        Nell
        Amelie
        Teagan
        Alyssa
        Helena
        Juliet
        Lia
        Beatrice
        Cadhla
        Fia
        Edie
        Harley
        Violet
        Oliwia
        Jade
        Melissa
        Sally
        Elle
        Leila
        Aisha
        Gabriella
        Addison
        Maryam
        Elodie
        Frankie
        Gráinne
        Alex
        Diana
        Daria
        Kyra
        Ana
        Lana
        Lillie
        Norah
        Belle
        Quinn
        Éadaoin
        Orlaith
        Erica
        Faith
        Libby
        Lillian
        Lyla
        Harriet
        Arya
        Cali
        Ellie-Mae
        Nova
        Skylar
        Aoibhínn
        Abby
        Jennifer
        Michaela
        Ali
        Claire
        Yasmin
        Dearbhla
        Lucie
        Piper
        Bláthnaid
        Clíodhna
        Úna
        Eabha
        Sorcha
        Andrea
        Kelsey
        Rosa
        Francesca
        Aliyah
        Klara
        Mabel
        Lila
        Bailey
        Emmie
        Kaia
        Nela
        Skyler
        Roisín
        Sinéad
        Danielle
        Aleksandra
        Amanda
        Bronagh
        Darcey
        Ema
        Hope
        Antonia
        Saibh
        Juno
        Margot
        Síomha
        Moya
        Stephanie
        Christina
        Martha
        Carly
        Marie
        Maebh
        Ria
        Alisa
        Mariam
        Miriam
        Evelina
        Elisa
        Connie
        Billie
        Liadh
        Pola
        May
        Avery
        Priya
        Ariella
        Myla
        Louise
        Joanna
        Ally
        Annabel
        Cleo
        Eloise
        Vivienne
        Dara
        Gloria
        Kali
        Eliana
        Zahra
        Maisy
        Maci
        Croíadh
        Heather
        Claudia
        Aideen
        Ann
        Elisha
        Bethany
        Joy
        Sadbh
        Meghan
        Andreea
        Marta
        Arianna
        Halle
        Iseult
        Ayesha
        Myah
        Aya
        Emelia
        Kylie
        Aurelia
        Alba
        Harlow
        Indy
        Kenzie
        Khloe
        Lilah
        Saorlaith
        Valentina
        Adeline
        Dani
        Haniya
        Stevie
        Seoidín
        Shannon
        Jodie
        Kelly
        Wiktoria
        Jenna
        Ashley
        Karolina
        Sasha
        Fatima
        Helen
        Keela
        Natalie
        Beibhinn
        Meadhbh
        Weronika
        Erika
        Imogen
        Angelina
        Winnie
        Amira
        Aida
        Milana
        Autumn
        Marcelina
        Reina
        Rylee
        Michelle
        Leona
        Fiona
        Meabh
        Carla
        Kaitlyn
        Brianna
        Kacey
        Nikola
        Samantha
        Linda
        Sandra
        Serena
        Veronica
        Eileen
        Johanna
        Lauryn
        Madeleine
        Louisa
        Laragh
        Milena
        Izabella
        Paula
        Bianca
        Alessia
        Annalise
        Olive
        Ceoladh
        Edith
        Ryleigh
        Sonia
        Anaya
        Bowie
        Vada
        Eibhlín
        Esmée
        Tori
        Gabrielle
        Julie
        Angel
        Lexie
        Lea
        Una
        Neasa
        Demi
        Karina
        Esther
        Pia
        Emilija
        Leyla
        Martina
        Anne
        Daniela
        Rosemary
        Jessie
        Kyla
        Maura
        Seren
        Mai
        Polly
        Kornelia
        Selena
        Delia
        Ellie-May
        Giulia
        Kitty
        Dakota
        Ella-Mae
        Lily-Mae
        Maddie
        Melody
        Sofija
        Blake
        June
        Philippa
        Caitlín
        Órlaith
        Réiltín
        Zoë
        Síne
        Alaia
        Abbey
        Emer
        Patricia
        Charley
        Ailish
        Paulina
        Alexa
        Caoilinn
        Eilish
        Emilie
        Jamie
        Greta
        Makayla
        Mary-Kate
        Adele
        Christine
        Kaya
        Miya
        Eryn
        Lina
        Amina
        Elisabeth
        Gianna
        Irene
        Izabela
        Kaylee
        Lily-Rose
        Aifric
        Alma
        Bobbi
        Ellie-Mai
        Gaia
        Lois
        Alia
        Dorothy
        Drew
        Georgie
        Lilianna
        Melisa
        Aubrey
        Ida
        Kyah
        Rayna
        Stefania
        Everleigh
        Everly
        Wynter
        Chloé
        Mairéad
        Nicola
        Lisa
        Rachael
        Chantelle
        Sabrina
        Laila
        Charlie
        Melanie
        Caitlyn
        Klaudia
        Deborah
        Angela
        Stacey
        Nia
        Tianna
        Zainab
        Teresa
        Celine
        Nelly
        Saorla
        Aliya
        Judith
        Lili
        Neala
        Paris
        Alise
        Amna
        Anya
        Leia
        Mackenzie
        Selina
        Winifred
        Amalia
        Adah
        Adelina
        Agnes
        Alayna
        Amara
        Amaya
        Ella-Rose
        Indi
        Joni
        Liana
        Macie
        Melania
        Noor
        Rebeca
        Rowan
        Syeda
        Ayra
        Beatrix
        Fallon
        Freyja
        Noreen
        Vayda
        Harleigh
        Winter
        Aibhín
        Béibhinn
        Bríd
        Cáit
        Éirinn
        Íde
        Máire
        Nainsí
        Nóra
        Órla
        Réaltín
        Sibéal
        Érin
        Shona
        Keira
        Aoibhin
        Martyna
        Kirsten
        Katherine
        Tia
        Caroline
        Gabija
        Jorja
        Daniella
        India
        Susan
        Clare
        Enya
        Caoilainn
        Adriana
        Kiara
        Madeline
        Samara
        Kimberly
        Vanesa
        Alexia
        Milly
        Aoileann
        Hayleigh
        Kira
        Hana
        Livia
        Alva
        Anais
        Darci
        Dora
        Gwen
        Kaja
        Maud
        Rosanna
        Wendy
        Alina
        Alix
        Allison
        Ameila
        Anastazja
        Khadija
        Kiya
        Lavinia
        Aiza
        Arwen
        Aubree
        Averie
        Barbara
        Celeste
        Eibhlin
        Eshaal
        Ines
        Jasmina
        Josie
        Kalina
        Leja
        Miley
        Minnie
        Talia
        Theodora
        Yasmina
        Bella-Rose
        Brooklyn
        Delilah
        Eila
        Emmi
        Gia
        Ioana
        Lukne
        Marianna
        Myra
        Nel
        Raina
        Serah
        Tillie
        Yara
        Ellie mae
        Adaline
        Effie
        Faya
        Paisley
        Tuiren
        Aodhla
        Essie
        Aimée
        Ariyah
        Ayat
        Clíona
        Evelin
        Mirha
        Renée
        Fiádh
        Leanne
        Chelsea
        Nadine
        Avril
        Josephine
        Carrie
        Kamila
        Lorna
        Simone
        Dawn
        Jenny
        Kathryn
        Sive
        Gabriele
        Kaci
        Tiffany
        Magdalena
        Mikayla
        Alexandria
        Antonina
        Katy
        Fionnuala
        Jana
        Jess
        Katrina
        Philomena
        Estera
        Iga
        Joyce
        Julianna
        Kimberley
        Larissa
        Patricija
        Sofie
        Yusra
        Camelia
        Carmen
        Carolina
        Emmanuella
        Honor
        Lainey
        Alexis
        Audrey
        Bria
        Ebony
        Emile
        Hailie
        Honey
        Lidia
        Adela
        Adelaide
        Amelia-Rose
        Amirah
        Anabelle
        Ela
        Elia
        Elina
        Ellie-Rose
        Emmy
        Isha
        Jannat
        Kaiya
        Karlie
        Kendall
        Kourtney
        Kyrah
        Lily Mae
        Lyra
        Malwina
        Mara
        Marnie
        Miah
        Migle
        Moira
        Nika
        Reagan
        Soraya
        Thalia
        Treasa
        Vivien
        Afric
        Alena
        Ariah
        Atene
        Athena
        Betty
        Constance
        Darla
        Diya
        Eman
        Fatimah
        Flora
        Giorgia
        Jayda
        Kady
        Kaelyn
        Kora
        Leen
        Liepa
        Lilli
        Liv
        Maisey
        Marwa
        Meadow
        Mina
        Mira
        Miruna
        Olivija
        Oonagh
        Poppie
        Raya
        Remy
        Rena
        Riadh
        Roxanne
        Shelby
        Sommer
        Teodora
        Zoya
        Noa
        Meara
        Romi
        Harlee
        Esmai
        Saileog
        Sloane
        Córa
        Erín
        Júlia
        Lilith
        Lylah
        Reya
        Ríadh
        Rua
        Seána
        Shóna
        Líle
        Siana
        Mealla
        Sia
        Rylie
        Peigí
        Mollaí
        Lucía
        Seóna
        Aylah
        Alys
        Cíara
        Céala
        Damaris
        Blossom
        Féile
        Aadhya
        Éila
        Éire
        Sinead
        Gemma
        Abi
        Keelin
        Kellie
        Cliona
        Tegan
        Karen
        Sharon
        Kiera
        Alesha
        Shania
        Deirdre
        Joanne
        Kasey
        Toni
        Dominika
        Orlagh
        Caoilfhionn
        Kayley
        Kerrie
        Noelle
        Valerie
        Genevieve
        Julianne
        Noemi
        Zarah
        Bernadette
        Meg
        Princess
        Tamara
        Teegan
        Agata
        Brigid
        Denise
        Kaitlin
        Mary Kate
        Rhiannon
        Rita
        Sylvia
        Teigan
        Theresa
        Aela
        Aleena
        Elsa
        Marina
        Michalina
        Tiana
        Celina
        Destiny
        Elaina
        Haley
        Iman
        Isolde
        Olwyn
        Rebeka
        Samira
        Sefora
        Tabitha
        Ailis
        Alissa
        Astrid
        Bebhinn
        Caela
        Cecelia
        Ekaterina
        Eunice
        Evanna
        Frances
        Izzy
        Kallie
        Luiza
        Mallaidh
        Matylda
        Adina
        Amaia
        Amelija
        Arisha
        Asia
        Ayah
        Bianka
        Blanka
        Camilla
        Caoileann
        Cassidy
        Cindy
        Ella May
        Ella Rose
        Fae
        Gaja
        Hafsa
        Ina
        Inaaya
        Izabelle
        Lilla
        Luisa
        Luka
        Macy
        Manuela
        Marika
        Milla
        Molly Mae
        Petra
        Peyton
        Pixie
        Raisa
        Riah
        Shayla
        Susanna
        Sylvie
        Teja
        Tierna
        Urszula
        Viktoria
        Zoja
        Allegra
        Anabia
        Ananya
        Andra
        Anika
        Anna Rose
        Annabella
        Arina
        Beatriz
        Blair
        Bobbie
        Caelyn
        Dalia
        Darya
        Elianna
        Emilee
        Emily-Rose
        Emmeline
        Esmay
        Estela
        Feena
        Hanorah
        Ilinca
        Indiana
        Iqra
        Kaitlynn
        Karly
        Kiyah
        Laya
        Lilly-May
        Lori
        Luana
        Malika
        Marin
        Meadbh
        Mona
        Montana
        Nella
        Pennie
        Radha
        Raven
        Rawan
        Rida
        Riya
        Roseanne
        Salome
        Sana
        Shae
        Suzie
        Tabita
        Tasneem
        Trinity
        Viola
        Zaina
        Zosia
        Esmae
        Joanie
        Alayah
        Della
        Perrie
        Naya
        Nola
        Ailís
        Aodha
        Bébhinn
        Brídín
        Brónagh
        Clódagh
        Éile
        Eilís
        Ríonach
        Roísín
        Síle
        Siobhán
        Xenia
        Mayla
        Rhéa
        Rheia
        Léana
        Mayar
        Zara-Rose
        Zimal
        Rafaela
        Saylor
        Mei
        Sofía
        Teona
        Theadora
        Kenzi
        Kataleya
        Neansaí
        Lyanna
        Marlowe
        Raiya
        Veda
        Mahnoor
        Selin
        Maram
        Melany
        Yuval
        Areen
        Éada
        Ava Grace
        Ériu
        Aviana
        Alaya
        Aibhilín
        Ecaterina
        Bláthín
        Bodhi
        Anna May
        Alondra
        Éadha
        Eimíle
        Aífe
        Aliana
        Amelia Rose
        Críoa
        Adia
        Croí
        Dáire
        Dallas
        Anays
        Ivy-Rose`.split(/\n/);

        // Top 100 Irish Surnames (https://www.swilson.info/topsurnames.php)
        var sNames = 
        `Murphy
        Kelly
        Sullivan
        Walsh
        Smith
        Byrne
        Ryan
        Connor
        Reilly
        Doyle
        McCarthy
        Gallagher
        Doherty
        Kennedy
        Lynch
        Murray
        Quinn
        Moore
        McLaughlin
        Carroll
        Connolly
        Daly
        Connell
        Wilson
        Dunne
        Brennan
        Burke
        Collins
        Campbell
        Clarke
        Johnston
        Hughes
        Farrell
        Fitzgerald
        Brown
        Martin
        Maguire
        Nolan
        Flynn
        Thompson
        Callaghan
        Duffy
        Mahony
        Boyle
        Healy
        Shea
        White
        Sweeney
        Hayes
        Kavanagh
        Power
        McGrath
        Moran
        Brady
        Stewart
        Casey
        Foley
        Fitzpatrick
        Leary
        McDonnell
        McMahon
        Donnelly
        Regan
        Donovan
        Burns
        Flanagan
        Mullan
        Barry
        Kane
        Robinson
        Cunningham
        Griffin
        Kenny
        Sheehan
        Ward
        Whelan
        Lyons
        Reid
        Graham
        Higgins
        Cullen
        Keane
        King
        Maher
        McKenna
        Bell
        Scott
        Hogan
        Keeffe
        Magee
        McNamara
        McDonald
        McDermott
        Moloney
        Rourke
        Buckley
        Dwyer`.split(/\n/);

        // merge boys and girls names-remove duplication
        // maybe could have used (must check!):
        // = Array.from(new Set(bNames.concat(...gNames)))
        var fNames = [...new Set([...bNames, ...gNames])];

        // set up protytype for random selection from array
        Array.prototype.sample = function () {
            return this[Math.floor(Math.random() * this.length)];
        }

        // set up array shuffle using Fisher-Yates method
        Array.prototype.shuffle = function () {
            var i = this.length, j, temp;
            if (i == 0) return this;
            while (--i) {
                j = Math.floor(Math.random() * (i + 1));
                temp = this[i];
                this[i] = this[j];
                this[j] = temp;
            }
            return this;
        }

        // get a random name
        function getRandomFirstName() {
            return fNames.sample().trim();
        }
        function getRandomSurName() {
          return sNames.sample().trim();
        }
        
        // shuffle the boys and girls names (and surnames ... sure why not!)
        fNames.shuffle(); sNames.shuffle();
