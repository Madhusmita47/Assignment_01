const mongoose = require("mongoose");

const dnsRecordSchema = new mongoose.Schema({
    domain: {
        type: String,
        required:true
    },
    recordType: {
        type: String,
        required:true
    },
    recordData: {
        type: String,
        required:true
    }
}, { timestamps: true })

module.exports = mongoose.model("DnsRecord", dnsRecordSchema)