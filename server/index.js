const express = require("express")
const mongoose = require("mongoose")
const app = express();
const cors = require("cors")
// const AWS = require('./aws-config');
// const route53 = new AWS.Route53();
app.use(cors());

app.use(express.json());

mongoose.connect("mongodb+srv://madhusmita_123:5fiVrKsOKBIGJsKe@cluster0.cpbhduk.mongodb.net/Assignment")
    .then(() => console.log("Mongodb is Connected"))
    .catch((err) => console.log("Error Connecting to Mongodb",err))

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running  on port ${PORT}`);
})

const DnsRecord = require ("./model/dnsModel")

// CRUD operations

app.post('/dns/record', async (req, res) => {
    const { domain, recordType, recordData } = req.body;

    try {
        const newRecord = await DnsRecord.create({ domain, recordType, recordData });
        res.status(201).json({ success: true, data: newRecord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Read DNS records by domain
app.get('/dns/records/:domain', async (req, res) => {
    const domain = req.params.domain;

    try {
        const records = await DnsRecord.find({ domain });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update DNS record
app.put('/dns/record/:id', async (req, res) => {
    const id = req.params.id;
    const { domain, recordType, recordData } = req.body;

    try {
        const updatedRecord = await DnsRecord.findByIdAndUpdate(id, { domain, recordType, recordData }, { new: true });
        res.status(200).json({ success: true, data: updatedRecord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete DNS record
app.delete('/dns/record/:id', async (req, res) => {
    const id = req.params.id;

    try {
        await DnsRecord.findByIdAndDelete(id);
        res.status(200).json({ success: true,message:"Deleted Successfull" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


module.exports = app;