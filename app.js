//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
const mysql = require("mysql2");
const date = require("date");
global.no_of_passengers = 0;
global.cost = 0;
global.food = [];
global.flightSelDetails = {};
global.passengerDetails = {};
global.airlineIdATC = 0;
global.flightNoATC = 0;
global.ticketDetails = [];
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "airport2",
});

function generateRandomString() {
  var length = 7;
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("SQL database connected as id " + connection.threadId);
});

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/airportAdminDB", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("MongoDB connected!");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
mongoose.set("strictQuery", false);

const adminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const Admin = mongoose.model("Admin", adminSchema);
const foodSchema = new mongoose.Schema({
  ItemId: Number,
  FoodName: String,
  FoodType: String,
  Cost: Number,
  ImgUrl: String,
});
const Food = mongoose.model("Food", foodSchema);

const orderSchema = new mongoose.Schema({
  ItemId: Number,
  PassengerId: Number,
  Quantity: Number,
});
const Order = mongoose.model("Order", orderSchema);

app.get("/", function (req, res) {
  res.render("home");
});

//Admin
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/admin_login.html");
});
app.post("/admin-home", function (req, res) {
  const username = req.body.user_name;
  const password = md5(req.body.your_pass);
  Admin.findOne({ username: username }, function (err, result) {
    if (!err) {
      if (result) {
        if (password === result.password)
          res.sendFile(__dirname + "/admin_opt.html");
        else res.redirect("/login");
      }
    } else console.log(err);
  });
});

app.get("/addAirHostess", function (req, res) {
  res.sendFile(__dirname + "/addAirHostess.html");
});
app.post("/addAirHostess", function (req, res) {
  const request = req.body;
  const name = request.name;
  const staffId = request.staff_id;
  const hostessId = request.airhostess_id;
  const airlineId = request.airline_id;
  var SQL = "INSERT INTO AirportStaff VALUES ?";
  var values = [[staffId, "Air Hostess"]];
  connection.query(SQL, [values], function (err) {
    if (!err) {
      console.log("Airport staff inserted sucessfully");
      SQL = "INSERT INTO AirHostess VALUES ?";
      values = [[hostessId, name, airlineId]];
      connection.query(SQL, [values], function (err) {
        if (!err) {
          console.log("Air Hostess inserted sucessfully");
          SQL = "INSERT INTO WorksOn VALUES ?";
          values = [[airlineId, staffId, hostessId]];
          connection.query(SQL, [values], function (err) {
            if (!err) {
              console.log("Air Hostess inserted sucessfully in workson");
              res.render("done");
            } else console.log(err);
          });
        } else console.log(err);
      });
    } else console.log(err);
  });
});

app.get("/deleteAirHostess", function (req, res) {
  res.sendFile(__dirname + "/deleteHost.html");
});
app.post("/deleteAirHostess", function (req, res) {
  const request = req.body;
  const hostessId = request.airhostess_id;
  var SQL = "SELECT StaffId FROM WorksOn WHERE AirHostessId = ?";
  var values = hostessId;
  var staffId;
  connection.query(SQL, [values], function (err, result, fields) {
    if (!err) {
      staffId = result[0]["StaffId"];
      SQL = "DELETE FROM AirportStaff WHERE StaffId = ?";
      values = staffId;
      connection.query(SQL, [values], function (err, result) {
        if (!err) {
          SQL = "DELETE FROM AirHostess WHERE AirHostessId = ?";
          values = hostessId;
          connection.query(SQL, [values], function (err, result) {
            if (!err) {
              console.log("Deletion successful");
              res.render("done");
            }
          });
        } else console.log(err);
      });
    } else console.log(err);
  });
});

app.get("/addTC", function (req, res) {
  res.sendFile(__dirname + "/addTc.html");
});
app.post("/addTC", function (req, res) {
  const request = req.body;
  const name = request.name;
  const staffId = request.staff_id;
  const tcId = request.airtc_id;
  const runwayId = request.runway_id;
  var SQL = "INSERT INTO AirportStaff VALUES ?";
  var values = [[staffId, "Air Traffic Controller"]];
  connection.query(SQL, [values], function (err) {
    if (!err) {
      console.log("Airport staff inserted sucessfully");
      SQL = "INSERT INTO AirTrafficController VALUES ?";
      values = [[tcId, runwayId, staffId]];
      connection.query(SQL, [values], function (err) {
        if (!err) {
          console.log("Air Traffic Controller inserted sucessfully");
          res.render("done");
        } else console.log(err);
      });
    } else console.log(err);
  });
});

app.get("/deleteTC", function (req, res) {
  res.sendFile(__dirname + "/DeleteTC.html");
});
app.post("/deleteTC", function (req, res) {
  const request = req.body;
  const controllerId = request.controller_id;
  var SQL = "SELECT StaffId FROM AirTrafficController WHERE ControllerId = ?";
  var values = controllerId;
  var staffId;
  connection.query(SQL, [values], function (err, result, fields) {
    if (!err) {
      console.log(result);
      staffId = result[0]["StaffId"];
      SQL = "DELETE FROM AirportStaff WHERE StaffId = ?";
      values = staffId;
      connection.query(SQL, [values], function (err, result) {
        if (!err) {
          console.log("Air traffic controller deleted.");
          res.render("done");
        } else console.log(err);
      });
    } else console.log(err);
  });
});

app.get("/addGS", function (req, res) {
  res.sendFile(__dirname + "/addGS.html");
});
app.post("/addGS", function (req, res) {
  const request = req.body;
  const name = request.name;
  const staffId = request.staff_id;
  const gsId = request.groundstaff_id;
  const location = request.location;
  const jobType = request.job_type;
  var SQL = "INSERT INTO AirportStaff VALUES ?";
  var values = [[staffId, "Ground Staff"]];
  connection.query(SQL, [values], function (err) {
    if (!err) {
      console.log("Airport staff inserted sucessfully");
      SQL = "INSERT INTO GroundStaff VALUES ?";
      values = [[gsId, location, jobType, staffId]];
      connection.query(SQL, [values], function (err) {
        if (!err) {
          console.log("Ground staff inserted sucessfully");
          res.render("done");
        } else console.log(err);
      });
    } else console.log(err);
  });
});

app.get("/deleteGS", function (req, res) {
  res.sendFile(__dirname + "/DeleteGS.html");
});
app.post("/deleteGS", function (req, res) {
  const request = req.body;
  const gsId = request.gs_id;
  var SQL = "SELECT StaffId FROM GroundStaff WHERE GroundStaffId = ?";
  var values = gsId;
  var staffId;
  connection.query(SQL, [values], function (err, result, fields) {
    if (!err) {
      console.log(result);
      staffId = result[0]["StaffId"];
      SQL = "DELETE FROM AirportStaff WHERE StaffId = ?";
      values = staffId;
      connection.query(SQL, [values], function (err, result) {
        if (!err) {
          console.log("Ground Staff deleted.");
          res.render("done");
        } else console.log(err);
      });
    } else console.log(err);
  });
});

app.get("/adminFlightList", function (req, res) {
  var SQL =
    "select f.airlineid, f.flightno, f.source, f.destination, f.date_of_flight, f.no_of_seats, count(*) as booked from flight f, ticket t where f.flightno = t.flightno and f.airlineid = t.airlineid";
  connection.query(SQL, function (err, result) {
    if (!err) {
      if (result) {
        console.log(result);
        const formattedArray = result.map((obj) => {
          const date = new Date(obj.date_of_flight);
          const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          return { ...obj, date_of_flight: formattedDate };
        });
        res.render("adminflight_list", { flights: formattedArray });
      } else {
        console.log("Empty list");
        res.sendFile(__dirname + "/admin_opt.html");
      }
    } else {
      console.log(err);
    }
  });
});

app.get("/searchFlight", function (req, res) {
  res.sendFile(__dirname + "/search_flight.html");
});
app.post("/searchFlight", function (req, res) {
  const request = req.body;
  const airlineId = request.airline_id;
  const flightNo = request.flight_no;
  var SQL =
    "select f.airlineid, f.flightno, f.source, f.destination, f.date_of_flight, f.no_of_seats, count(*) as booked from flight f, ticket t where f.flightno = t.flightno and f.airlineid = t.airlineid and f.airlineid = ? and f.flightno = ?";
  var values = [airlineId, flightNo];
  connection.query(SQL, values, function (err, result, fields) {
    if (!err) {
      if (result && result[0].airlineid !== null) {
        console.log(result);
        const formattedArray = result.map((obj) => {
          const date = new Date(obj.date_of_flight);
          const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          return { ...obj, date_of_flight: formattedDate };
        });
        res.render("adminflight_list", { flights: formattedArray });
      } else {
        console.log("Empty list");
        res.sendFile(__dirname + "/admin_opt.html");
      }
    } else console.log(err);
  });
});

//Book Tickets
app.post("/checkFlights", function (req, res) {
  const request = req.body;
  const date = request.date;
  const source = request.source;
  const destination = request.destination;
  global.no_of_passengers = request.quantity;
  console.log(request);
  SQL =
    "select f.airlineid, a.airline_name, f.flightno, f.price, f.arrivaltime, f.departuretime, f.no_of_seats, f.source, f.destination, a.gate from flight f, airline a where f.airlineid = a.airlineid and f.source = ? and f.destination = ? and f.date_of_flight = ? and f.no_of_seats > 0";
  values = [source, destination, date];
  connection.query(SQL, values, function (err, result) {
    if (!err) {
      console.log(result);
      res.render("checkFlights", { flights: result });
    } else console.log(err);
  });
});

app.post("/checkout", function (req, res) {
  const request = req.body;
  console.log(request);
  console.log("Hello here: ");
  Object.assign(global.passengerDetails, request);
  console.log(typeof global.passengerDetails.name);
  if (typeof global.passengerDetails.name == "string") {
    for (const key of Object.keys(global.passengerDetails)) {
      global.passengerDetails[key] = [global.passengerDetails[key]];
    }
  }
  for (var i = 0; i < global.passengerDetails.name.length; i++) {
    console.log(global.passengerDetails.name[i]);
  }
  if (request.submit === "order_food") res.redirect("/food");
  else res.redirect("/payment");
});

app.post("/book_tickets", function (req, res) {
  console.log(req.body);
  console.log(global.no_of_passengers);
  Object.assign(global.flightSelDetails, req.body);
  console.log(
    "Flight details selected : " + JSON.stringify(global.flightSelDetails)
  );
  console.log(global.flightSelDetails.price);
  global.cost = global.no_of_passengers * req.body.price;
  console.log(global.cost);
  res.render("book", {
    number: global.no_of_passengers,
    no_of_seats: req.body.no_of_seats,
  });
});

app.get("/book", function (req, res) {
  res.sendFile(__dirname + "/ticket_booking.html");
});

app.get("/payment", function (req, res) {
  var SQL = "";
  global.ticketDetails = [];
  console.log(global.no_of_passengers);
  async function insertPassengers() {
    for (var i = 0; i < global.no_of_passengers; i++) {
      console.log(" i : " + i);
      try {
        const result = await getCountFromPassengerTable();
        console.log(result[0]["counter"]);
        var counter = result[0]["counter"] + 1;
        SQL = "INSERT INTO Passenger VALUES ?";
        console.log(global.passengerDetails.name);
        console.log(global.passengerDetails.name[i]);
        var PNR = generateRandomString();
        var values = [
          [
            counter,
            global.passengerDetails.name[i],
            PNR,
            global.passengerDetails.no_of_luggages[i],
            global.flightSelDetails.flightNo,
          ],
        ];
        console.log("Values  : " + values);
        await insertValuesIntoPassengerTable(values);
        values = [
          [
            PNR,
            global.passengerDetails.seat[i],
            global.flightSelDetails.flightNo,
            global.passengerDetails.class[i],
            global.flightSelDetails.source,
            global.flightSelDetails.destination,
            global.flightSelDetails.gate,
            global.cost,
            global.flightSelDetails.airlineID,
          ],
        ];
        console.log("Values  : " + values);
        await insertValuesIntoTicketTable(values);
        values = [[counter, PNR, global.passengerDetails.seat[i]]];
        await insertValuesIntoBooksTable(values);
        console.log("Passenger details inserted into the database.");
        values = [PNR, global.passengerDetails.seat[i], global.flightSelDetails.flightNo, global.flightSelDetails.airlineID];
        await getTicket(values)
      } catch (err) {
        console.log(err);
      }
    }
  }

  function getCountFromPassengerTable() {
    return new Promise(function (resolve, reject) {
      var SQL = "SELECT COUNT(*) as counter from Passenger";
      connection.query(SQL, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function insertValuesIntoPassengerTable(values) {
    return new Promise(function (resolve, reject) {
      var SQL = "INSERT INTO Passenger VALUES ?";
      connection.query(SQL, [values], function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function insertValuesIntoTicketTable(values) {
    return new Promise(function (resolve, reject) {
      var SQL = "INSERT INTO Ticket VALUES ?";
      connection.query(SQL, [values], function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function insertValuesIntoBooksTable(values) {
    return new Promise(function (resolve, reject) {
      var SQL = "INSERT INTO Books VALUES ?";
      connection.query(SQL, [values], function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function getTicket(values){
    return new Promise(function (resolve, reject) {
      var SQL = "SELECT t.PNR, t.seatno, t.flightno, t.airlineid, t.class, t.source, t.destination, t.gate, f.arrivaltime, f.departuretime, a.airline_name, p.name from Ticket t, flight f, airline a, passenger p, books b where t.flightno = f.flightno and t.airlineid = f.airlineid and t.airlineid = a.airlineid and p.passengerid = b.passengerid and b.pnr = t.pnr and t.PNR = ? and t.seatno = ? and t.flightno = ? and t.airlineid = ? ";
      connection.query(SQL, values, function (err, result) {
        if (err) {
          reject(err);
        } else {
          console.log(result);
          console.log(JSON.stringify(result));
          global.ticketDetails.push(result);
          console.log("Obtained  : " + JSON.stringify(global.ticketDetails));
          resolve(result);
        }
      });
    });
  }

  insertPassengers()
    .then(function () {
      console.log("All passenger details inserted into the database.");
      res.render("payment", { total_cost: global.cost, ticket : global.ticketDetails});
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/pass_sign.html");
});

app.get("/food", function (req, res) {
  Food.find({}, function (err, result) {
    if (!err) {
      if (result) {
        global.food = result;
        res.render("foodOrdering", { contents: result });
      }
    } else console.log(err);
  });
});

app.get("/calculator", function (req, res) {
  const encodedData = req.query.data;
  const data = JSON.parse(decodeURIComponent(encodedData));
  console.log(data);
  for (var k = 0; k < data.length; k++) {
    var number = data[k];
    global.cost = global.cost + number * global.food[k].Cost;
  }
  console.log(global.cost);
  res.redirect("/payment");
});
app.get("/videoStream", function (req, res) {
  res.sendFile(__dirname + "/passportVerify.html");
});
app.get("/foodOrderCheck", function (req, res) {
  Order.find({}, function (err, results) {
    console.log(results);
    res.render("fooderOrderChecking", { contents: results });
  });
});

app.post("/show-ticket", function (req, res) {
  res.render("ticket");
});

app.get("/loader", function (req, res) {
  res.sendFile(__dirname + "/loader.html");
});

app.get("/hello", function (req, res) {
  res.sendFile(__dirname + "/verified.html");
});

app.get("/retake", function (req, res) {
  res.sendFile(__dirname + "/retake.html");
});

app.get("/flight-control", function(req, res){
  res.sendFile(__dirname + "/tc_search.html");
});
app.post("/flight-control", function(req, res){
  const request = req.body;
  console.log(request);
  global.airlineIdATC = request.airline_no;
  global.flightNoATC = request.flight_no;
  if(request.submit == "view-status"){
    var SQL = "SELECT f.airlineid, f.flightno, a.airline_name, f.runwayassigned, f.airbus_ground, f.trafficclearance, f.groundstaffinformed from flight f, airline a where f.airlineid = a.airlineid and f.flightno = ? and f.airlineid = ?";
    var values = [global.flightNoATC, global.airlineIdATC];
    connection.query(SQL, values, function(err, result){
      console.log(result);
      res.render("viewTC", {details : result});
    });
  }
  else{
    res.render("EditTC");
  }
});

app.post("/edit-status", function(req, res){
  const request = req.body;
  console.log(request);
  var SQL = "UPDATE flight SET runwayassigned = ?, airbus_ground = ?, trafficclearance = ?, groundstaffinformed = ? WHERE flightno = ? and airlineid = ?";
  var values = [request.runway_assigned, request.airbus_ground, request.tra_cle, request.g_s, global.flightNoATC, global.airlineIdATC];
  connection.query(SQL, values, function(err, result){
    if(!err){
      console.log("Update done");
      res.render("done");
    }
    else
    console.log(err);
  })
});

app.post('/ordered-food', (req, res) => {
  const myArray2 = req.body;
  const myArray = encodeURIComponent(JSON.stringify(myArray2))
  console.log("Here it is : " + myArray);
  res.redirect("/calculator?data=" + myArray);
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is up and listening at Port 3000.");
});
