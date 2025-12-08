const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

let database, listingsCollection, orderCollection;


async function connectDB() {
  if (!database) {
    await client.connect();
    database = client.db('PawMart');
    listingsCollection = database.collection('listings');
    orderCollection = database.collection('orders');
    console.log("Connected to MongoDB!");
  }
}



app.get('/', (req, res) => {
  res.send('PawMart API is running');
});

// POST API to add a listing
app.post('/listings', async (req, res) => {
  try {
    await connectDB();
    const listing = req.body;
    const date = new Date();
    listing.createAt = date.toISOString();
    const result = await listingsCollection.insertOne(listing);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET API to fetch all listings
app.get('/listings', async (req, res) => {
  try {
    await connectDB();
    const { category } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }
    const result = await listingsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET API to fetch a single listing by ID
app.get('/listings/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const listing = await listingsCollection.findOne(query);
    res.send(listing);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/my-listings', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.query;
    const query = { email: email };
    const result = await listingsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// API to update a listing
app.put('/update/:id', async (req, res) => {
  try {
    await connectDB();
    const data = req.body;
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const updatedListing = { $set: data };
    const result = await listingsCollection.updateOne(query, updatedListing);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// API to delete a listing
app.delete('/delete/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await listingsCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// POST API to create an order
app.post('/orders', async (req, res) => {
  try {
    await connectDB();
    const order = req.body;
    const result = await orderCollection.insertOne(order);
    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET API to fetch all orders
app.get('/orders', async (req, res) => {
  try {
    await connectDB();
    const { email } = req.query;
    let query = {};
    if (email) {
      query.email = email;
    }
    const result = await orderCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET API to fetch listings by category
app.get('/category-filtered-product/:category', async (req, res) => {
  try {
    await connectDB();
    const { category } = req.params;
    const query = { category: category };
    const listings = await listingsCollection.find(query).toArray();
    res.send(listings);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET latest 6 listings
app.get('/latest-listings', async (req, res) => {
  try {
    await connectDB();
    const listings = await listingsCollection
      .find({})
      .sort({ createAt: -1 })
      .limit(6)
      .toArray();
    res.send(listings);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`PawMart is running on port ${port}`);
  });
}


module.exports = app;