import admin from "firebase-admin";
import express from "express";
import fs from "fs";
import cors from "cors";

const serviceAccount = JSON.parse(fs.readFileSync('./key.json', 'utf-8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'fir-firestore-8fb0b.firebasestorage.app'
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8080;
const db = admin.firestore();
const storage = admin.storage().bucket();

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
});


// GET API
app.get('/users/get', async (req, res) => {
    try {
        const collectionRef = db.collection('users');
        const snapshot = await collectionRef.get();
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).send({
            success: true,
            message: "Users returned",
            data: data
        })

    } catch(error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});


// POST API
app.post('/users/post', async (req, res) => {
    try {   
        const userJson = {
            name: req.body.name,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            img: req.body.img
        };

        await db.collection('users').add(userJson);

        res.status(200).send({
            success: true,
            message: "User created"
        });

    } catch(error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});


// PUT API
app.put('/users/put/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

        const docRef = db.collection('users').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        await docRef.update(updatedData);

        res.status(200).send({
            success: true,
            message: "User updated"
        });

    } catch(error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});


// DELETE API
app.delete('/users/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const docRef = db.collection('users').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        await docRef.delete();

        res.status(200).send({
            success: true,
            message: "User deleted"
        })

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
});

