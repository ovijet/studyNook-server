const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
dotenv.config();

app.use(cors());
app.use(express.json());

// const PORT = 5000;
app.get("/", (req, res) => {
  res.send("server in running");
});
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


const JWKS=createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const token= async(req,res,next)=>{
    const auth=req.headers.authorization
    if (!auth) {
      return res.status(401).json({message:'unauthorized'})
    }
    const token=auth.split(' ')[1]
     if (!token) {
      return res.status(401).json({message:'unauthorized'})
    }
    console.log(token,'xxxx');
         try {
            const {payload}=await jwtVerify(token,JWKS)
          next()
         } catch (error) {
  return res.status(403).json({message:'forbidden'})
         }
}


async function run() {
  try {
    // await client.connect();

    const db = client.db("studyNook");
    const studyCollection = db.collection("study");
    const bookingCollection = db.collection("booking");

    app.get("/study", async (req, res) => {
      const result = await studyCollection.find().toArray();
      res.json(result);
    });

    app.get('/featured',async (req,res)=>{
      const result =await studyCollection.find().limit(3).toArray()
      res.json(result)
    })

    app.get("/booking/:userId", async (req, res) => {
      const { userId } = req.params;

      const result = await bookingCollection.find({ userId }).toArray();

      res.json(result);
    });


    app.get("/my-listings", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).send({ message: "Email required" });
    }

    const result = await studyCollection
      .find({ ownerEmail: email })
      .toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

    app.get("/booking", async (req, res) => {
      const result = await bookingCollection.find().toArray();

      res.send(result);
    });

    app.get("/study/:id",

token,


  async (req, res) => {
    const { id } = req.params;

    const result = await studyCollection.findOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  }
);


// listing er jonno post

app.post("/study", async (req, res) => {
  try {
    const room = req.body;

    // DB insert
    const result = await studyCollection.insertOne(room);

    res.status(201).send({
      success: true,
      message: "Room created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});


// listing er jonno get
// app.get("/study/my", async (req, res) => {
//   try {
//     const email = req.query.email; // or from token

//     if (!email) {
//       return res.status(400).send({ error: "Email required" });
//     }

//     const myRooms = await RoomCollection
//       .find({ ownerEmail: email })
//       .toArray();

//     res.send(myRooms);
//   } catch (error) {
//     res.status(500).send({ error: "Server error" });
//   }
// });

   

    app.post("/booking", async (req, res) => {
  const booking = req.body;

  const result = await bookingCollection.insertOne({
    ...booking,
    createdAt: new Date(),
  });

  res.json(result);
});

    app.post("/study", token, async (req, res) => {
      const study = req.body;

      console.log(study);
      const data = await studyCollection.insertOne(study);
      res.json(data);
    });

    // await client.db("admin").command({ ping: 1 });
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
