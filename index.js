const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_SECRET}@cluster0.hhplj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const bistroDBCollections = client.db("bistroDB")
    const bistroMenu = bistroDBCollections.collection("menu");
    const cartCollections = bistroDBCollections.collection("carts");
    const userCollections = bistroDBCollections.collection("users");


    app.get('/menu', async(req, res) => {
      const result = await bistroMenu.find().toArray();
      res.send(result);
    })

    app.post('/carts', async (req, res) => {
      const data = req.body;
      const result = await cartCollections.insertOne(data);
      res.send(result);
    })

    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = {email: email};
      const result = await cartCollections.find(query).toArray();
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartCollections.deleteOne(query);
      res.send(result);
    })



    // Users related APIs
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await userCollections.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists', insertedId: null})
      }
      const result = await userCollections.insertOne(user);
      res.send(result);
    })

    app.get('/users', async (req, res) => {
      const result = await userCollections.find().toArray();
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollections.deleteOne(query);
      res.send(result);
    })

    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedData = {
        $set: {
          role: 'admin',
        }
      };
      const result = await userCollections.updateOne(filter, updatedData);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})