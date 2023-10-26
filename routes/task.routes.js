const express = require('express');
const router = express.Router();
const Task = require('../models/task.model');
const {checkAdmin, checkLoggedIn, canEditTask, verifyToken, authMiddleware } = require('../middleware/index.middleware');



router.post('/task',authMiddleware, checkLoggedIn,  async (req, res) => {
    try {
        const { title, description, status } = req.body;
        console.log(req.body);
        console.log('req.user._id:', req.user.userId);
        const newTask = new Task({
            title,
            description,
            status,
            userId: req.user._id /* ! userID error on used req.user need to fix */
        });

        await newTask.save();

        req.io.emit('taskCreated', newTask);

        res.json({ message: 'Task created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Task creation failed' });
    }
});

router.get('/task', checkLoggedIn, async (req, res) => {
    try {
        const allTasks = await Task.find();
        res.json(allTasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({ "message": error });
    }
});

router.patch('/task/:taskId', checkLoggedIn,canEditTask, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, status } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                title,
                description,
                status,
            },
            { new: true }
        );

        req.io.emit('taskUpdated', updatedTask);

        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Task update failed' });
    }
});

router.delete('/task/:taskId', checkLoggedIn,  canEditTask, async (req, res) => {
    try {
        const {taskId} = req.params;

        const deletedTask = await Task.findByIdAndRemove(taskId);

        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        req.io.emit('taskDeleted', deletedTask);

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Task deletion failed' });
    }
})

module.exports = router;