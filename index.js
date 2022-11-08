const express = require('express')
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require('cors')
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

        app.get('/services',async(req,res)=>{
         const query = {};
         const cursor = serviceCollection.find(query);
         // const services = await cursor.skip(3).limit(3).toArray();
         const services = await cursor.toArray()
         const count = await serviceCollection.estimatedDocumentCount()
         res.send({count,services});

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

