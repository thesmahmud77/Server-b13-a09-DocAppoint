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
const userCollection = db.collection("user");

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
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid appointment ID format" });
  }

  try {
    const query = { _id: new ObjectId(id) };

    const result = await appointmentCollection.deleteOne(query);

    if (result.deletedCount === 1) {
      res.status(200).send(result);
    } else {
      res.status(404).send({ message: "Appointment not found" });
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

app.patch("/update-user", async (req, res) => {
  try {
    const email = req.query.email;
    const { name, photo } = req.body;

    // উপরে যে userCollection আগে থেকেই বানানো আছে, সেটাই ব্যবহার করো
    const result = await userCollection.updateOne(
      { email: email },
      { $set: { name: name, image: photo } },
    );
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});

// একটা নির্দিষ্ট appointment আইডি দিয়ে fetch করার জন্য
app.get("/appointments/:id", async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid appointment ID format" });
  }

  try {
    const query = { _id: new ObjectId(id) };
    const result = await appointmentCollection.findOne(query);

    if (!result) {
      return res.status(404).send({ message: "Appointment not found" });
    }

    res.send(result);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// appointment আপডেট করার জন্য
app.patch("/appointments/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid appointment ID format" });
  }

  try {
    const query = { _id: new ObjectId(id) };
    const result = await appointmentCollection.updateOne(query, {
      $set: updatedData,
    });

    res.send(result);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

app.get("/doctors/search", async (req, res) => {
  const query = req.query.query || "";

  try {
    const searchQuery = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { specialty: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const result = await doctorsCollection.find(searchQuery).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error searching doctors:", error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
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
