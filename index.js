const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

app.use(cors());
app.use(express.json());

// const PORT = 5000;
app.get("/", (req, res) => {
  res.send("server in running");
});
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("studyNook");
    const studyCollection = db.collection("study");
    const bookingCollection = db.collection("booking");

    app.get("/study", async (req, res) => {
      const result = await studyCollection.find().toArray();
      res.json(result);
    });

    app.get("/study/:id", async (req, res) => {
      const { id } = req.params;

      const result = await studyCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.json(result);
    });

    app.post("/study", async (req, res) => {
      const study = req.body;

      console.log(study);
      const data = await studyCollection.insertOne(study);
      res.json(data);
    });

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

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
