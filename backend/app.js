var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const fs = require("fs");
var request = require("request");
var extract = require("extract-zip");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// Connect to Mongo on start
mongoose.connect("mongodb://localhost/parker", { useNewUrlParser: true });

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

// Pull parking meter data and save to data directory
let writeStream = fs.createWriteStream("../data/parking_meters.kmz", {
  flags: "w"
});
writeStream.on("open", () => {
  console.log("Saving parking meter data");
  request
    .get(
      "https://data.vancouver.ca/download/kml/parking_meter_rates_and_time_limits.kmz"
    )
    .pipe(writeStream);
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;