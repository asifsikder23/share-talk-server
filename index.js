const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
app.use(cors());
app.use(express.json());
const jwt = require("jsonwebtoken");
require("dotenv").config();

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0iyuemt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  client.connect();
  console.log("database connected");
  const usersCollection = client.db("shareTalk").collection("users");
  const postsCollection = client.db("shareTalk").collection("posts");
  const commentCollection = client.db("shareTalk").collection("comment");

  // jwt
  app.get("/jwt", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    if (user) {
      const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
        expiresIn: "10h",
      });
      return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: "" });
  });

  // user
  app.post("/users", async (req, res) => {
    const user = req.body;
    console.log(user);
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });

  app.get("/users", async (req, res) => {
    const query = {};
    const result = await usersCollection.find(query).toArray();
    res.send(result);
  });
  app.get("/user/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = { _id: ObjectId(id) };
    const result = await usersCollection.findOne(query);
    res.send(result);
  });
  app.get("/editProfile/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = { _id: ObjectId(id) };
    const result = await usersCollection.findOne(query);
    res.send(result);
  });
  app.get("/user", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await usersCollection.findOne(query);
    res.send(result);
  });

  // update

  app.put("/users/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const user = req.body;
    const option = { upsert: true };
    const updatedUser = {
      $set: {
        name: user.name,
        institute: user.institute,
        address: user.address,
        birthdate: user.birthdate,
        gender: user.gender,
        description: user.description,
        coverImg: user.coverImg,
        photo: user.photo,
      },
    };
    const result = await usersCollection.updateOne(filter, updatedUser, option);
    res.send(result);
  });

  // post
  app.post("/posts", async (req, res) => {
    const user = req.body;

    const result = await postsCollection.insertOne(user);
    res.send(result);
  });
  app.get("/posts", async (req, res) => {
    const query = {};
    const result = await postsCollection
      .find(query)
      .sort({ $natural: -1 })
      .toArray();
    res.send(result);
  });
  app.get("/posts/:id", async (req, res) => {
    const id = req.params.id;

    const query = { _id: ObjectId(id) };
    const result = await postsCollection.findOne(query);
    res.send(result);
  });
  app.get("/post", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await postsCollection.find(query).toArray();
    res.send(result);
  });

  // Like
  app.put("/like/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $inc: {
        like: 1,
      },
    };
    const result = await postsCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  });

  // comment
  app.post("/comment", async (req, res) => {
    const query = req.body;
    const result = await commentCollection.insertOne(query);
    res.send(result);
  });
  app.get("/comment", async (req, res) => {
    const query = req.body;
    const result = await commentCollection.find(query).toArray();
    res.send(result);
  });
  app.get("/comment/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await commentCollection.findOne(query);
    res.send(result);
  });

  // top post
  app.get("/topPost", async (req, res) => {
    const query = req.body;
    const cursor = postsCollection.find(query).sort({like: -1});
    const result = await cursor.limit(3).toArray();
    res.send(result);
  });
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
