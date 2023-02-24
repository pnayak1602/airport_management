//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");
const mysql = require('mysql2');
const date = require('date');
global.no_of_passengers = 0;
global.cost = 0;
global.food = [];
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'airport'
});
function generateRandomString() {
  var length = 7;
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

// connection.query('SELECT * FROM Airline', function (error, results, fields) {
//   if (error) throw error;
//   console.log(results);
// });

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/airportAdminDB', {useNewUrlParser : true});
mongoose.set('strictQuery', false);

const adminSchema = new mongoose.Schema({
    username : String,
    email: String,
    password : String
});
const Admin = mongoose.model("Admin", adminSchema);

const foodSchema = new mongoose.Schema({
  ItemId : Number,
  FoodName : String,
  FoodType : String,
  Cost : Number,
  ImgUrl : String
});
const Food = mongoose.model("Food", foodSchema);

const orderSchema = new mongoose.Schema({
  ItemId : Number,
  PassengerId : Number,
  Quantity : Number
});
const Order = mongoose.model("Order", orderSchema);


console.log("Connection successful");


app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function(req, res){
  res.sendFile(__dirname + "/admin_login.html");
});
app.post("/login", function(req, res){
  const username = req.body.user_name;
  const password = md5(req.body.your_pass);
  Admin.findOne({username : username}, function(err, result){
    if(!err)
    {
      if(result)
      {
        if(password === result.password)
        res.sendFile(__dirname + "/admin_opt.html");
        else
        res.redirect("/login");
      }
    }
    else
    console.log(err);
  });
});

app.get("/addAirHostess", function(req, res){
  res.sendFile(__dirname + "/addAirHostess.html");
});
app.post("/addAirHostess", function(req, res){
  const request = req.body;
  const name = request.name;
  const staffId = request.staff_id;
  const hostessId = request.airhostess_id;
  const airlineId = request.airline_id;
  var SQL = "INSERT INTO AirportStaff VALUES ?";
  var values = [[staffId, 'Air Hostess']];
  connection.query(SQL, [values], function(err){
    if(!err)
    {
      console.log("Airport staff inserted sucessfully");
      SQL = "INSERT INTO AirHostess VALUES ?";
      values = [[hostessId, name, airlineId]];
      connection.query(SQL, [values], function(err){
        if(!err)
        {
          console.log("Air Hostess inserted sucessfully");
          SQL = "INSERT INTO WorksOn VALUES ?";
          values = [[airlineId, staffId, hostessId]];
          connection.query(SQL, [values], function(err){
            if(!err)
            {
              console.log("Air Hostess inserted sucessfully in workson");
              res.render("done");
            }
            else
            console.log(err);
          });
        }
        else
        console.log(err);
      });
    }
    else
    console.log(err);
  });
});

app.get("/deleteAirHostess", function(req, res){
  res.sendFile(__dirname + "/deleteHost.html");
});
app.post("/deleteAirHostess", function(req, res){
  const request = req.body;
  const hostessId = request.airhostess_id;
  var SQL = "SELECT StaffId FROM WorksOn WHERE AirHostessId = ?";
  var values = hostessId;
  console.log("air hostess id : " + hostessId);
  var staffId;
  connection.query(SQL, [values], function(err, result, fields){
    if(!err)
    {
      staffId = result[0]["StaffId"];
      console.log("Airport StaffId : " + staffId);
      SQL = "DELETE FROM WorksOn WHERE StaffId = ?";
      values = staffId;
      console.log("values : " + values);
      connection.query(SQL, [values], function(err, result){
        if(!err)
        {
          console.log("Airport staff deleted from WorksOn. " + result.affectedRows);
          SQL = "DELETE FROM AirHostess WHERE AirHostessId = ?";
          values = hostessId;
          connection.query(SQL, [values], function(err,result){
            if(!err)
            {
              console.log("Airport staff " + staffId + " deleted." + result.affectedRows);
              SQL = "DELETE FROM AirportStaff WHERE StaffId = ?";
              values = staffId;
              connection.query(SQL, [values], function(err, result){
                if(!err)
                {
                  console.log("Airport staff deleted." + result.affectedRows);
                  res.render("done");
                }
                else
                console.log(err);
              });
            }
            else
            console.log(err);
          });
        }
        else
        console.log(err);
      });
    }
    else
    console.log(err);
  });
});

app.get("/addTC", function(req, res){
  res.sendFile(__dirname + "/addTc.html");
  
});
app.post("/addTC", function(req, res){
  const request = req.body;
  const name = request.name;
  const staffId = request.staff_id;
  const tcId = request.airtc_id;
  const runwayId = request.runway_id;
  var SQL = "INSERT INTO AirportStaff VALUES ?";
  var values = [[staffId, 'Traffic Controller']];
  connection.query(SQL, [values], function(err){
    if(!err)
    {
      console.log("Airport staff inserted sucessfully");
      SQL = "INSERT INTO AirTrafficController VALUES ?";
      values = [[tcId, runwayId, staffId]];
      connection.query(SQL, [values], function(err){
        if(!err)
        {
          console.log("Air Traffic Controller inserted sucessfully");
          res.render("done");
        }
        else
        console.log(err);
      });
    }
    else
    console.log(err);
  });
});

app.get("/deleteTC", function(req, res){
  res.sendFile(__dirname + "/DeleteTC.html");
});
app.get("/addGS", function(req, res){
  res.sendFile(__dirname + "/addGS.html");
});
app.post("/addGS", function(req, res){
  const request = req.body;
  const name = request.name;
  const staffId = request.staff_id;
  const gsId = request.groundstaff_id;
  const location = request.location;
  const jobType = request.job_type;
  var SQL = "INSERT INTO AirportStaff VALUES ?";
  var values = [[staffId, 'Ground Staff']];
  connection.query(SQL, [values], function(err){
    if(!err)
    {
      console.log("Airport staff inserted sucessfully");
      SQL = "INSERT INTO GroundStaff VALUES ?";
      values = [[gsId, location, jobType, staffId]];
      connection.query(SQL, [values], function(err){
        if(!err)
        {
          console.log("Ground staff inserted sucessfully");
          res.render("done");
        }
        else
        console.log(err);
      });
    }
    else
    console.log(err);
  });
});
//deleteGS not there
app.get("/deleteGS", function(req, res){
  res.sendFile(__dirname + "/addGroundStaff.html");
});
app.get("/adminFlightList", function(req, res){
  var SQL = "select f.airlineid, f.flightno, f.source, f.destination, f.date_of_flight, f.no_of_seats, count(*) as booked from flight f, ticket t where f.flightno = t.flightno and f.airlineid = t.airlineid";
  connection.query(SQL, function(err, result){
    if(!err)
    {
      console.log(result);
      const formattedArray = result.map(obj => {
        const date = new Date(obj.date_of_flight);
        const formattedDate = date.toLocaleDateString("en-US", {year: 'numeric', month: '2-digit', day: '2-digit'});
        return {...obj, date_of_flight: formattedDate};
      });      
      res.render("adminflight_list", {flights : formattedArray});
    }
    else
    console.log(err);
  });
});
app.get("/searchFlight", function(req, res){
  res.sendFile(__dirname + "/search_flight.html");
});
app.post("/searchFlight", function(req, res){
  const request = req.body;
  const airlineId = request.airline_id;
  const flightNo = request.flight_no;
  var SQL = "select f.airlineid, f.flightno, f.source, f.destination, f.date_of_flight, f.no_of_seats, count(*) as booked from flight f, ticket t where f.flightno = t.flightno and f.airlineid = t.airlineid and f.airlineid = ? and f.flightno = ?";
  var values = [airlineId, flightNo];
  connection.query(SQL, values, function(err, result, fields){
    if(!err)
    {
      console.log(result);
      const formattedArray = result.map(obj => {
        const date = new Date(obj.date_of_flight);
        const formattedDate = date.toLocaleDateString("en-US", {year: 'numeric', month: '2-digit', day: '2-digit'});
        return {...obj, date_of_flight: formattedDate};
      });      
      res.render("adminflight_list", {flights : formattedArray});
    }
    else
    console.log(err);
  });
});


app.post("/checkFlights", function(req, res){
  const request = req.body;
  const date = request.date;
  const source = request.source;
  const destination = request.destination;
  global.no_of_passengers = request.quantity;
  console.log(request);
  SQL = "select f.airlineid, a.airline_name, f.flightno, f.price, f.arrivaltime, f.departuretime from flight f, airline a where f.airlineid = a.airlineid and f.source = ? and f.destination = ? and f.date_of_flight = ?";
  values = [source, destination, date];
  connection.query(SQL, values, function(err, result){
    if(!err)
    {
      console.log(result);
      res.render("checkFlights",{flights : result});
    }
    else
    console.log(err);
  });
});
app.post("/checkout", function(req, res){
  const request = req.body;
  if(request.submit === "order_food")
  res.redirect("/food");
  else
  res.redirect("/payment", {total_cost : global.cost});
});
app.post("/book_tickets", function(req, res){
  console.log(req.body);
  console.log(global.no_of_passengers);
  global.cost = global.no_of_passengers * (req.body.price);
  res.render("book", {number : global.no_of_passengers});
});
app.get("/book", function(req, res){
  res.sendFile(__dirname + "/ticket_booking.html");
});
app.get("/payment", function(req, res){
  res.render("payment", {total_cost : global.cost});
});
app.get("/signup", function(req, res){
  res.sendFile(__dirname + "/pass_sign.html");
});

app.get("/food", function(req, res){
  Food.find({}, function(err, result){
    if(!err)
    {
      if(result)
      {
        global.food = result;
        res.render("foodOrdering", {contents : result});
      }
    }
    else
    console.log(err);
  });
});

app.post("/calculator", function(req, res){
  // console.log(global.food);
  for(var k=0;k<global.food.length;k++)
  {
    var randomVariable = Math.floor(Math.random() * 2);
    global.cost = global.cost + randomVariable * global.food[k].Cost;
  }
  console.log(global.cost);
  res.render("payment", {total_cost : global.cost});
});
app.get("/videoStream", function(req, res){
  res.sendFile(__dirname + "/passportVerify.html");
});
app.get("/foodOrderCheck", function(req, res){
  Order.find({},function(err, results){
    console.log(results);
    res.render("fooderOrderChecking", {contents : results});
  });
});

app.get("/loader", function(req, res){
  res.sendFile(__dirname + "/loader.html");
});

app.get("/hello", function(req, res){
  res.sendFile(__dirname + "/verified.html");
});
app.get("/retake", function(req, res){
  res.sendFile(__dirname + "/retake.html");
})

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is up and listening at Port 3000.");
});
