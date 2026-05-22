const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
const uri =
  "mongodb+srv://docappoint:kjkk9FEPCPVVh2Hd@cluster0.w4xj3al.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("DocAppoint");
const doctorsCollection = db.collection("Doctors");
const appointmentCollection = db.collection("Appointments");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get("/top-3-doctor", async (req, res) => {
      const cursor = doctorsCollection.find().limit(3).sort({ experience: 1 });
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/all-doctor", async (req, res) => {
      const cursor = doctorsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/doctors", async (req, res) => {
      const cursor = doctorsCollection.find();
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });

    app.get("/doctors/:doctorId", async (req, res) => {
      const { doctorId } = req.params;
      const query = { _id: new ObjectId(doctorId) };
      const result = await doctorsCollection.findOne(query);
      res.send(result);
    });

    // Create Appointment API (এখন req.body পারফেক্টলি ডাটা পাবে)
    app.post("/appointments", async (req, res) => {
      const data = req.body;
      const result = await appointmentCollection.insertOne(data);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
