let chai = require("chai")
let chaiHttp = require("chai-http")
let server = require("../../bin/www")
let expect = chai.expect
chai.use(require("chai-things"))
let datastore = require("../../models/donations")

chai.use(chaiHttp)
let _ = require("lodash" )

describe("Donationss", function (){
  beforeEach(() => {  
    while(datastore.length > 0) {
      datastore.pop()
    }  
    datastore.push( 
      {id: 1000000, paymenttype: "PayPal", amount: 1600, upvotes: 1}
    )
    datastore.push( 
      {id: 1000001, paymenttype: "Direct", amount: 1100, upvotes: 2}
    )
  })
  describe("GET /donations", () => {
    it("should GET all the donations", function(done) {
      chai.request(server)
        .get("/donations")
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a("array")
          expect(res.body.length).to.equal(2)
          let result = _.map(res.body, (donation) => {
            return { id: donation.id,
              amount: donation.amount } 
          })
          expect(result).to.include( { id: 1000000, amount: 1600  } )
          expect(result).to.include( { id: 1000001, amount: 1100  } )
          done()
        })
    })
  })
  describe("POST /donations", function () {
    it("should return confirmation message and update datastore", function(done) {
      let donation = { 
        paymenttype: "Visa" , 
        amount: 1200, 
        upvotes: 0
      }
      chai.request(server)
        .post("/donations")
        .send(donation)
        .end( (err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.have.property("message").equal("Donation Added!" ) 
          done()
        })
    })
    after(function  (done) {
      chai.request(server)
        .get("/donations")
        .end(function(err, res) {
          expect(res).to.have.status(200)
          expect(res.body).be.be.a("array")
          let result = _.map(res.body, function (donation) {
            return { paymenttype: donation.paymenttype, 
              amount: donation.amount }
          }  )
          expect(result).to.include( { paymenttype: "Visa", amount: 1200  } )
          done()
        })
    })
  })

  describe("PUT /donations/:id/vote", function () {
    it("should return a message and the donation upvoted by 1", function(done) {
      chai.request(server)
        .put("/donations/1000001/vote")
        .end(function(err, res) {
          expect(res).to.have.status(200)
          let donation = res.body.data 
          expect(donation).to.include( { id: 1000001, upvotes: 3  } )
          done()
        })
    })
    it("should return a 404 and a message for invalid donation id", function(done) {
      chai.request(server)
        .put("/donations/1100001/vote")
        .end(function(err, res) {
          expect(res).to.have.status(404)
          expect(res.body).to.have.property("message","Invalid Donation Id!" ) 
          done()
        })
    })

  })
  describe("DELETE /donations/:id", function () {
    describe("when id is valid", function () {
      it("should return a confirmation message and the deleted donation", function(done) {
        chai.request(server)
          .delete("/donations/1000001")
          .end( (err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message","Donation Successfully Deleted!" ) 
            done()
          })
      })
      after(function  (done) {
        chai.request(server)
          .get("/donations")
          .end(function(err, res) {
            expect(res).to.have.status(200)
            expect(res.body).be.be.a("array")
            let result = _.map(res.body, function (donation) {
              return { paymenttype: donation.paymenttype, 
                amount: donation.amount }
            }  )
            expect(result).to.not.include( { paymenttype: "Visa", amount: 1200  } )
            done()
          })
      })
    })
    describe("when id is invalid", function () {
      it("should return an error message", function(done) {
        chai.request(server)
          .delete("/donations/1000002")
          .end( (err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property("message","Donation NOT DELETED!" ) 
            done()
          })
      })
    })
  })
})