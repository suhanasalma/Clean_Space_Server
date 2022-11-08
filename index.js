const express = require('express')
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

console.log(uri)

async function run(){
   try{
      const serviceCollection = client
        .db("cleaningService")
        .collection("Services");

      const reviewCollection = client.db("cleaningService").collection('reviews')

        app.get('/services',async(req,res)=>{
         const page = parseInt(req.query.page)
         const size = parseInt(req.query.size)
         console.log(page,size)
         const query = {};
         const cursor = serviceCollection.find(query);
         const services = await cursor.skip(page*size).limit(size).toArray();
         // const services = await cursor.toArray()
         const count = await serviceCollection.estimatedDocumentCount()
         res.send({count,services});

        })

        app.get('/services/:id',async(req,res)=>{
         const id = req.params.id
         const query = {_id:ObjectId(id)}  
         const service = await serviceCollection.findOne(query);
         res.send(service)

        })

        app.post('/comments',async(req,res)=>{
           const comment = req.body;
           console.log(comment)
           const result = await reviewCollection.insertOne(comment);
           res.send(result)
        })


        
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

