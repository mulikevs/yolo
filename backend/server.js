const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const upload = multer();
const config = require('./_config');

const productRoute = require('./routes/api/productRoute');

// Connecting to the Database
const environment = 'development';
let mongoURI = config.mongoURI[environment];
// let dbName = 'yolomy';

// define a url to connect to the database
mongoose.connect(mongoURI.replace('mongodb://', 'mongodb+srv://'), {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
});

// Log successful DB connection
mongoose.connection.once('open', () => {
    console.log('Database connected successfully');
});


// Check for DB Errors
// db.on('error', (error)=>{
//     console.log(error);
// })

// Initializing express
const app = express()

// Body parser middleware
app.use(express.json())

// 
app.use(upload.array()); 

// Cors 
app.use(cors());

// Use Route
app.use('/api/products', productRoute)

// Define the PORT
const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server listening on port ${PORT}`)
})
