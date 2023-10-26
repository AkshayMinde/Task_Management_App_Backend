const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['todo', 'inprogress', 'completed'], 
        required: true 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },

});

module.exports = mongoose.model('Task', taskSchema);