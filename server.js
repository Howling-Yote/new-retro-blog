const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define the correct path
const publicPath = path.join("C:", "Users", "test", "Documents", "Web Projects", "90s-blog", "public");
console.log('Public directory path:', publicPath);

// Serve static files from the public directory
app.use(express.static(publicPath));

// MongoDB connection configuration
const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/90s_blog?directConnection=true', {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Force IPv4
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to MongoDB before starting the server
connectDB().then(() => {
    // Routes
    app.get('/', (req, res) => {
        const splashPath = path.join(publicPath, "splash.html");
        res.sendFile(splashPath);
    });

    app.get('/index.html', (req, res) => {
        const indexPath = path.join(publicPath, "index.html");
        res.sendFile(indexPath);
    });

    app.post('/api/guestbook', async (req, res) => {
        try {
            console.log('Received guestbook entry:', req.body);

            // Create a date in 1999
            const date1999 = new Date();
            date1999.setFullYear(1999);

            const entry = new GuestbookEntry({
                name: req.body.name,
                email: req.body.email,
                homepage: req.body.homepage || '',
                message: req.body.message,
                date: date1999  // Use the 1999 date instead of new Date()
            });

            const savedEntry = await entry.save();
            console.log('Entry saved successfully:', savedEntry);
            res.status(201).json({ message: 'Guestbook entry saved!', entry: savedEntry });
        } catch (error) {
            console.error('Error saving entry:', error);
            res.status(500).json({ error: 'Error saving entry', details: error.message });
        }
    });

    app.get('/api/guestbook', async (req, res) => {
        try {
            console.log('Fetching guestbook entries');
            const entries = await GuestbookEntry.find().sort({ date: -1 });
            console.log(`Found ${entries.length} entries`);
            res.json(entries);
        } catch (error) {
            console.error('Error fetching entries:', error);
            res.status(500).json({ error: 'Error fetching entries', details: error.message });
        }
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Access the website at http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to MongoDB:', error);
});

// Guestbook Model
const GuestbookEntry = require('./models/guestbook');

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});


const Visitor = require('./models/visitorCounter');

// Increment visitor count endpoint
app.get('/api/visitor-count', async (req, res) => {
    try {
        console.log('Visitor count endpoint called');
        let visitor = await Visitor.findOne();

        if (!visitor) {
            console.log('Initializing visitor counter');
            visitor = new Visitor({ count: 1 });
        } else {
            console.log('Current count:', visitor.count);
            visitor.count = visitor.count + 1;
            visitor.lastUpdated = Date.now();
        }

        const savedVisitor = await visitor.save();
        console.log('New count:', savedVisitor.count);

        res.json({ totalCount: savedVisitor.count });
    } catch (error) {
        console.error('Detailed visitor counter error:', error);
        res.status(500).json({ error: 'Error updating visitor count' });
    } 

});