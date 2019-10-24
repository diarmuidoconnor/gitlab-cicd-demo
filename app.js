/*eslint no-unused-vars: "off" */
let express = require("express")
let path = require("path")
let favicon = require("serve-favicon")
let logger = require("morgan")
let cookieParser = require("cookie-parser")
let bodyParser = require("body-parser")

let routes = require("./routes/index")
let users = require("./routes/users")
let donations = require("./routes/donations.js")

let app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
if (process.env.NODE_ENV !== "test") {  
  app.use(logger("dev"))
}
app.use("/", routes)
app.use("/users", users)

//Our Custom Routes
app.get("/donations", donations.findAll)
app.get("/donations/:id", donations.findOne)
app.post("/donations", donations.addDonation)
app.put("/donations/:id/votes", donations.incrementUpvotes)
app.delete("/donations/:id", donations.deleteDonation)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error("Not Found")
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render("error", {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render("error", {
    message: err.message,
    error: {}
  })
})


module.exports = app
