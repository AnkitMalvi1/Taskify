const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true,
        trim: true
    },
    status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    completedAt: { 
        type: Date,
        default: null
    }
});

// Middleware to update completedAt when status changes to completed
taskSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed') {
        this.completedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);