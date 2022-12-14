const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ilfiw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const database = client.db('carMechanic');
        const servicesCollection = database.collection('services');

        // get api
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // get single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting single service', id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        // post api
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result);
        });

        // put api 
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const service = req.body;
            console.log('hit the put api', service);
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set: {
                    name: service.name,
                    description: service.description,
                    price: service.price,
                    img: service.img
                }
            };
            const result = await servicesCollection.updateOne(filter, updateDoc, options);
            console.log('put success');
            res.json(result);
        })

        // delete api 
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            console.log('Delete success');
            res.json(result);
        })
    }
    finally {
        // await client.close();
    }
};

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Genius Car Mechanics Server Running');
});

app.listen(port, () => {
    console.log('Running Genius Server on port', port);
})


/* 
one time:
1. heroku account open
2. Heroku software install

Every project
1. git init
2. .gitignore (node_modules, .env)
3. push everything to git 
4. make sure you have this script: "start": "node index.js",
5. make sure: put process.env.PORT in front of your port nunber
6. heroku login
7. heroku create (only one time for a project)
8. command: git push heroku main
9. mongodb user & password share heroku
-----
project update 
1. save everything check locally
2. git add, git commit -m "", git push
3. git push heroku main
*/