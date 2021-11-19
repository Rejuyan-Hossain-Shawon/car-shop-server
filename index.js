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
        const usersCollection = database.collection("User");

        // // get all the Cars detail from data base
        app.get("/cars", async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.json(cars);
        })

        // post a car product means add a product

        app.post("/car", async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            res.json(result)
        })

        // car delete 
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await carsCollection.deleteOne(query);
            res.json(result);

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



        // save an user in the database;
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
        // make a user admin 

        app.put("/users/admin", async (req, res) => {
            console.log("hit");
            const user = req.body;
            console.log(req.body);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'Admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);
        })

        // making sure about admin
        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "Admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })




    }
    finally {
        // await client.close()
    }



}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


