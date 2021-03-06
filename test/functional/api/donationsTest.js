const chai = require("chai")
const expect = chai.expect
const request = require("supertest")
const { MongoClient } = require("mongodb")
const dotenv = require('dotenv');
dotenv.config();

const _ = require("lodash")

let server, db, client, collection, validID

describe("Donationss", () => {
  before(async () => {
    try {
      // mongod = new MongoMemoryServer({
      //   instance: {
      //     port: 27017,
      //     dbPath: "./test/database",
      //     dbName: "donationsdb" // by default generate random dbName
      //   }
      // })
      // url = await mongod.getConnectionString()
      client = await MongoClient.connect(
        process.env.MONGO_URI 
        , {
          useNewUrlParser: true,
          useUnifiedTopology: true
        })
      db = client.db(process.env.MONGO_DB)
      collection = db.collection("donations")
      server = require("../../../bin/www")
    } catch (error) {
      console.log(error)
    }
  })

  // after(async () => {
  //   try {
  //      client.close()
  //     // await mongod.stop()
  //     console.log('before server stop')
  //     await server.close()
  //     console.log('after server stop')

  //   } catch (error) {
  //     console.log(error)
  //   }
  // })

  beforeEach(async () => {
    try {
      await collection.deleteMany({})
      await collection.insertOne({
        paymenttype: "visa",
        amount: 1200,
        upvotes: 2
      })
      await collection.insertOne({
        paymenttype: "paypal",
        amount: 1000,
        upvotes: 0
      })
      const donation = await collection.findOne({ amount: 1200 })
      validID = donation._id
    } catch (error) {
      console.log(error)
    }
  })

  describe("GET /donations", () => {
    it("should GET all the donations", done => {
      request(server)
        .get("/donations")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            expect(res.body).to.be.a("array")
            expect(res.body.length).to.equal(2)
            let result = _.map(res.body, donation => {
              return {
                paymenttype: donation.paymenttype,
                amount: donation.amount
              }
            })
            expect(result).to.deep.include({
              paymenttype: "visa",
              amount: 1200
            })
            expect(result).to.deep.include({
              paymenttype: "paypal",
              amount: 1000
            })
            done()
          } catch (e) {
            done(e)
          }
        })
    })
  })
  describe("GET /donations/:id", () => {
    describe("when the id is valid", () => {
      it("should return the matching donation", done => {
        request(server)
          .get(`/donations/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body[0]).to.have.property("amount", 1200)
            expect(res.body[0]).to.have.property("paymenttype", "visa")
            done(err)
          })
      })
    })
    describe("when the id is invalid", () => {
      it("should return the NOT found message", done => {
        request(server)
          .get("/donations/9999")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end((err, res) => {
            expect(res.body.message).equals("Donation NOT Found!")
            done(err)
          })
      })
    })
  })
  describe("POST /donations", () => {
    it("should return confirmation message and update datastore", () => {
      const donation = {
        paymenttype: "Visa",
        amount: 1300,
        upvotes: 0
      }
      return request(server)
        .post("/donations")
        .send(donation)
        .expect(200)
        .then(res => {
          expect(res.body.message).equals("Donation Added!")
          validID = res.body.data._id
        })
    })
    after(() => {
      return request(server)
        .get(`/donations/${validID}`)
        .expect(200)
        .then(res => {
          expect(res.body[0]).to.have.property("amount", 1300)
          expect(res.body[0]).to.have.property("paymenttype", "Visa")
        })
    })
  })
  describe("PUT /donations/:id/vote", () => {
    describe("when the id is valid", () => {
      it("should return a message and the donation upvoted by 1", () => {
        return request(server)
          .put(`/donations/${validID}/votes`)
          .expect(200)
          .then(resp => {
            expect(resp.body).to.include({
              message: "Donation Upvoted!"
            })
            expect(resp.body.data).to.have.property("upvotes", 3)
          })
      })
      after(() => {
        return request(server)
          .get(`/donations/${validID}`)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .then(resp => {
            expect(resp.body[0]).to.have.property("upvotes", 3)
          })
      })
    })
    describe("when the id is invalid", () => {
      it("should return a 404 and a message for invalid donation id", () => {
        return request(server)
          .put("/donations/1100001/vote")
          .expect(404)
      })
    })
  })
})
