const express = require('express')
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require('cors');
const { response } = require('express');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express()


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kgzzpjr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


function verifyJWT (req,res,next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    res.status(401).send({message:'unathorized access'})
  }
  const token = authHeader.split(' ')[1];
  console.log(token)
  jwt.verify(token,process.env.JWT_Token, function(err,decoded){
    if(err){
      res.send(401).send({message:'unathorized user'})
    }
    req.decoded = decoded;
    next();
  })
  
}


async function run(){
   try{
     const serviceCollection = client
       .db("cleaningService")
       .collection("Services");

     const reviewCollection = client
       .db("cleaningService")
       .collection("reviews");

     app.post("/jwt", (req, res) => {
       const user = req.body;
       const token = jwt.sign(user, process.env.JWT_Token, { expiresIn: "1h" });
       res.send({ token });
     });   

     app.get("/services", async (req, res) => {
       const page = parseInt(req.query.page);
       const size = parseInt(req.query.size);
       const query = {};
       const cursor = serviceCollection.find(query).sort( {"_id" : -1} );
       const services = await cursor
         .skip(page * size)
         .limit(size)
         .toArray();
       const count = await serviceCollection.estimatedDocumentCount();
       res.send({ count, services });
     });

     app.post("/services", async (req, res) => {
       const service = req.body;
       const result = await serviceCollection.insertOne(service);
       res.send(result);
     });

     app.get("/services/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id: ObjectId(id) };
       const service = await serviceCollection.findOne(query);
       res.send(service);
     });

     app.post("/comments", async (req, res) => {
       const comment = req.body;
       const result = await reviewCollection.insertOne(comment);
       res.send(result);
     });

     app.get("/allcoments", async (req, res) => {
       let query = {};
       if (req.query.post) {
         query = { post: req.query.post };
         
       }
       const cursor = reviewCollection.find(query).sort({time:-1});
       const comments = await cursor.toArray();
       res.send(comments);
     });

     


       app.get("/comments", verifyJWT, async (req, res) => {
       const decoded = req.decoded;
       console.log("inside order api", decoded);
       if (decoded.email !== req.query.email) {
         res.status(403).send({ message: "unauthorized access" });
       }

       let query = {};

       if (req.query.email) {
         query = { email: req.query.email };
       }
       const cursor = reviewCollection.find(query).sort({time:-1});
       const comments = await cursor.toArray();
       res.send(comments);
     });


     app.get("/allcoments/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id: ObjectId(id) };
       const result = await reviewCollection.findOne(query);
       res.send(result);
     });

     app.patch("/allcoments/:id", async(req, res) => {
       const id = req.params.id;
       const filter = { _id: ObjectId(id) };
       const updateComment = req.body;
      //  console.log(updateComment)
       const options = { upsert: true };
       const updateInfo = {
         $set: {
           review: updateComment.review,
           time: updateComment.time,
         },
       }
       console.log(updateInfo)
       const result = await reviewCollection.updateOne(
         filter,
         updateInfo,
         options
       );
       console.log(result)
       res.send(result)

     });



     app.delete("/comments/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id: ObjectId(id) };
       const result = await reviewCollection.deleteOne(query);
       res.send(result);
     });
   }
   finally{

   }
}

run().catch(er=>console.log(er))





app.get('/',(req,res)=>{
   res.send('Cleaning Services Server is Running')
})

app.listen(port,()=>{
   console.log(`Port in running on ${port}`)
})

