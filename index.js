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

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

client
  .connect(() => {
    console.log("connecting to mongodb");
  })
  .catch(console.dir);

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

app.post("/appointments", async (req, res) => {
  const data = req.body;
  const result = await appointmentCollection.insertOne(data);
  res.send(result);
});

app.get("/appointments", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res
      .status(400)
      .send({ message: "Email query parameter is required" });
  }

  try {
    const query = { userEmail: email };
    const result = await appointmentCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res
      .status(500)
      .send({ message: "Failed to fetch appointments", error: error.message });
  }
});

app.delete("/appointments/:id", async (req, res) => {
  const id = req.params.id; // ক্লায়েন্ট থেকে পাঠানো আইডি রিসিভ করা

  // আইডি ভ্যালিডেশন (মঙ্গোডিবির ObjectId ফরম্যাট চেক করা)
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid appointment ID format" });
  }

  try {
    // ডিলিট করার জন্য কুয়েরি তৈরি করা
    const query = { _id: new ObjectId(id) };

    // ডাটাবেজ থেকে একটি ডকুমেন্ট ডিলিট করা
    const result = await appointmentCollection.deleteOne(query);

    if (result.deletedCount === 1) {
      res.status(200).send(result); // সফলভাবে ডিলিট হলে রেসপন্স পাঠানো
    } else {
      res.status(404).send({ message: "Appointment not found" }); // আইডি না পাওয়া গেলে
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});
// Send a ping to confirm a successful connection
// await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!",
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
