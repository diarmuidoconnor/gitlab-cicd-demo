let express = require("express")
let router = express.Router()

/* GET home page. */
// eslint-disable-next-line no-unused-vars
router.get("/", function(req, res, next) {
  res.render("index", { title: "SSD 4 - DonationWeb-3.0.Starter" })
})

module.exports = router
