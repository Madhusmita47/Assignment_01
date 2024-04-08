// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('./aws-config');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// AWS Route 53 initialization
const route53 = new AWS.Route53();

// Define API endpoints for CRUD operations

// Create DNS record
app.post('/dns/record', async (req, res) => {
    const { domain, recordType, recordData } = req.body;

    const params = {
        ChangeBatch: {
            Changes: [
                {
                    Action: 'CREATE',
                    ResourceRecordSet: {
                        Name: domain,
                        Type: recordType,
                        TTL: 300, // Example TTL, adjust as needed
                        ResourceRecords: [{ Value: recordData }]
                    }
                }
            ]
        },
        HostedZoneId: 'YOUR_HOSTED_ZONE_ID' // Hosted zone ID for your domain
    };

    try {
        const data = await route53.changeResourceRecordSets(params).promise();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Read DNS records
app.get('/dns/records/:domain', async (req, res) => {
    const domain = req.params.domain;

    const params = {
        HostedZoneId: 'YOUR_HOSTED_ZONE_ID', // Hosted zone ID for your domain
        StartRecordName: domain,
        StartRecordType: 'A', // Change if needed
        MaxItems: '100' // Adjust as needed
    };

    try {
        const data = await route53.listResourceRecordSets(params).promise();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update DNS record (not implemented here, similar to create operation)
// Delete DNS record (not implemented here, similar to create operation)

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





{/* <tbody>
          {console.log("records", records)}
          {records.map((record) => (
            <tr key={record._id}>
              <td>{record.domain}</td>
              <td>{record.recordType}</td>
              <td>{record.recordData}</td>
              <td>
                <button onClick={() => deleteRecord(record._id)}>Delete</button>
              </td>
              <td>
                <button onClick={() => updateRecord(record._id)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody> */}



        