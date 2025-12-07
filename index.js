const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const e = require('express');
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ybtdeyi.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db('PawMart');
    const listingsCollection = database.collection('listings');
    const orderCollection = database.collection('orders');
    // POST API to add a listing
    app.post('/listings', async (req, res) => {
      const listing = req.body;
      const date = new Date();
      listing.createAt = date;
      console.log(listing);
      const result = await listingsCollection.insertOne(listing);
      res.send(result);

    });

    //GET API to fetch all listings
    app.get('/listings', async (req, res) => {
      const { category } = req.query;
      const query = {};
      if (category) {
        query.category = category;
      }
      const result = await listingsCollection.find(query).toArray();
      res.send(result);
    });

    // GET API to fetch a single listing by ID
    app.get('/listings/:id', async (req, res) => {
      const id = req.params;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const listing = await listingsCollection.findOne(query);
      res.send(listing);
    });

    app.get('/my-listings', async (req, res) => {
      const { email } = req.query;
      const query = { email: email }
      const result = await listingsCollection.find(query).toArray();
      res.send(result);

    });
    //API to update a listing
    app.put('/update/:id', async (req, res) => {
      const data = req.body;
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const updatedListing = {
        $set: data
      }
      const result = await listingsCollection.updateOne(query, updatedListing);
      res.send(result);

    })
    // API to delete a listing
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await listingsCollection.deleteOne(query);
      res.send(result);
    });

    // POST API to create an order
    app.post('/orders', async (req, res) => {
      const order = req.body;
      console.log(order);
      const result = await orderCollection.insertOne(order);
      res.status(201).send(result);

    });

    // GET API to fetch all orders
    app.get('/orders', async (req, res) => {
      const { email } = req.query;

      let query = {};
      if (email) {
        query.email = email;
      }

      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });



    // GET API to fetch listings by category
    app.get('/category-filtered-product/:category', async (req, res) => {
      const category = req.params;   // same style as your ID route
      console.log(category);

      const query = { category: category.category };  // access category from req.params
      const listings = await listingsCollection.find(query).toArray();
      res.send(listings);
    });


    // GET latest 6 listings
    app.get('/latest-listings', async (req, res) => {
      const listings = await listingsCollection
        .find({}).sort({ createAt: -1 }).limit(6)
        .toArray();
      res.send(listings);
    });


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('PawMart is running');
});

app.listen(port, () => {
  console.log(`PawMart is running on port ${port}`);
});

