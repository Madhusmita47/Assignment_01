// aws-config.js

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'AKIAVUXSYHJINU3FWHDT',
    secretAccessKey: '3iOcMmi4fR7bs4zS+1tczvq5PSOlsGGXKdwfLcuw',
    region: 'YOUR_AWS_REGION'
});

module.exports = AWS;
