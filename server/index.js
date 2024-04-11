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
    .catch((err) => console.log("Error Connecting to Mongodb", err))

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running  on port ${PORT}`);
})

const DnsRecord = require("./model/dnsModel")
const validateRecordType = require("./validation/validation")
// CRUD operations

app.post('/dns/record', validateRecordType, async (req, res) => {
    const { domain, recordType, recordData } = req.body;

    try {
        const newRecord = await DnsRecord.create({ domain, recordType, recordData });
        res.status(201).json({ success: true, message: "Record Added Successfully", data: newRecord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Read DNS records by domain--------------------------
app.get('/dns/records/:domain', async (req, res) => {
    const domain = req.params.domain;

    try {
        const records = await DnsRecord.find({ domain });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// get all data---------------------------------
app.get('/dns/getallrecords', async (req, res) => {
    const { domain, recordType } = req.query;

    try {
        let query = {};
        if (domain) query.domain = { $regex: domain, $options: 'i' };
        if (recordType) query.recordType = recordType;

        const records = await DnsRecord.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update DNS record
app.put('/dns/record/:id', validateRecordType, async (req, res) => {
    const id = req.params.id;
    const { domain, recordType, recordData } = req.body;

    try {
        const updatedRecord = await DnsRecord.findByIdAndUpdate(id, { domain, recordType, recordData }, { new: true });
        res.status(200).json({ success: true, message: "Record Updated Successfully", data: updatedRecord });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete DNS record
app.delete('/dns/record/:id', async (req, res) => {
    const id = req.params.id;

    try {
        await DnsRecord.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Deleted Successfull" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

//------------------------------------------------------------------------------
const multer = require("multer")
const csv = require("csv-parser");
const fs = require("fs");
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage })
// validate.js

const allowedRecordTypes = [
    "A",
    "AAAA",
    "CNAME",
    "MX",
    "NS",
    "PTR",
    "SOA",
    "SRV",
    "TXT",
    "DNSSEC"
];
app.post('/fileupload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const file = req.file.path;

        const userData = [];
        let getError = [];
        let error = []

        fs.createReadStream(file)
            .on('error', (err) => {
                console.error("Error reading file:", err);
                res.status(500).json({ success: false, message: "Error reading file" });
            })
            .pipe(csv())
            .on('data', (row) => {
                // Process each row of the CSV file
                if (!allowedRecordTypes.includes(row.recordType)) {
                    getError.push('error');
                    error.push(row);
                } else {
                    getError.push(row);
                    userData.push({
                        domain: row.domain,
                        recordType: row.recordType,
                        recordData: row.recordData
                    });
                }

            })

            .on('end', async () => {
            
                const errorIndices = getError.reduce((acc, currentValue, index) => {
                    if (currentValue === 'error') {
                        acc.push(index + 2);
                    }
                    return acc;
                }, []);

                // Insert userData into the database after processing all rows
                try {
                    await DnsRecord.insertMany(userData);
                    if (error.length > 0) {
                        return res.status(400).send({ status: true, message: `Some error found in csv file. Please check these rows : "${errorIndices.join(", ")}"` });
                    } else {
                        return res.status(200).send({ status: true, message: "CSV imported successfully" });
                    }
                } catch (error) {
                    console.error("Error inserting data into database:", error);
                    res.status(400).json({ success: false, message: error.message });
                } finally {
                    // Cleanup: delete the uploaded file
                    fs.unlinkSync(req.file.path);
                }
            });
    } catch (error) {
        console.error("Error handling file upload:", error);
        res.status(400).json({ success: false, message: error.message });
    }
});


app.get('/aggregatedata', async (req, res) => {

    try {
        const aggregaterecordscounts = await DnsRecord.aggregate([{ $group: { _id: "$recordType", total_count: { $sum: 1 } } }, { $sort: { _id: 1 } }])

        const totalCount = aggregaterecordscounts.reduce((acc, curr) => acc + curr.total_count, 0);

        const totalpercentage = aggregaterecordscounts.map(record => ({
            _id: record._id,
            total_count: record.total_count,
            percentage: ((record.total_count / totalCount) * 100).toFixed(2)
        }));

        res.status(200).json({ success: true, count: aggregaterecordscounts, percentage: totalpercentage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = app;