var mongoose = require('mongoose');

// Define the schema
module.exports = mongoose.model('Todo', {
    text: {
        type: String,
        default: ''
    }
});
