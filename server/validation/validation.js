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

const validateRecordType = (req, res, next) => {
    const { recordType } = req.body;
    if (!allowedRecordTypes.includes(recordType)) {
        return res.status(400).json({ success: false, message: "Invalid record type provided" });
    }
    next();
};

module.exports = validateRecordType;
