const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const app = express()
const cors = require("cors")
require('dotenv').config()
const port = process.env.PORT || 5000


// middleware 
app.use(cors());
app.use(express.json());


// database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7niub.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('connect successfully');
        const database = client.db("carShop");
        const carsCollection = database.collection("cars");
        const ordersCollection = database.collection("Orders");
        const reviewsCollection = database.collection("Reviews");

        // // get all the Cars detail from data base
        app.get("/cars", async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.json(cars);
        })
        // get single car data
        app.get("/cars/:_id", async (req, res) => {
            const _id = req?.params?._id;
            const query = { _id: _id }
            const car = await carsCollection.findOne(query);
            res.json(car);
        })

        // place order 

        app.post("/orders", async (req, res) => {
            const order = req.body;
            order.status = "pending";
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        })
        // get all orders

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })



        // get my order by email
        app.get("/myorders", async (req, res) => {
            const email = req.query.email;

            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray();

            res.json(result)
        })
        //  order delete
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.json(result);

        })

        // update status of order

        app.put('/order/:id', async (req, res, next) => {
            const id = req.params.id;
            const order = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = { $set: order }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });







        // reviews

        app.post("/reviews", async (req, res) => {
            const data = req.body;
            const result = await reviewsCollection.insertOne(data);
            res.json(result)
        })

        app.get("/reviews", async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.json(result)
        })





        // // get all order of user 
        // app.get("/allorders", async (req, res) => {
        //     const cursor = ordersCollection.find({});
        //     const allOrders = await cursor.toArray();
        //     res.json(allOrders);
        // })


        // //   my order list done
        // app.get("/myorders", async (req, res) => {
        //     const emailData = req.query.email;
        //     console.log(emailData);
        //     if (emailData) {
        //         // Object.values(emailData) 
        //         const query = { email: emailData };
        //         const result = await ordersCollection.find(query).toArray();
        //         console.log(result);
        //         res.json(result)
        //     }


        // })
        // // get new tour program 

        // app.post("/program", async (req, res) => {
        //     const newTourProgram = req.body;
        //     const result = await tourProgramsCollection.insertOne(newTourProgram);

        //     res.json(result)
        // })

        // // post method order placed right fully
        // app.post("/program/order", async (req, res) => {

        //     const newOrder = req.body;
        //     const result = await ordersCollection.insertOne(newOrder);

        //     res.json(result);

        // })
        // // delete method by id 

        // app.delete("/order/delete/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }
        //     const result = await ordersCollection.deleteOne(query);
        //     res.json(result);


        // })


    }
    finally {
        // await client.close()
    }



}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


