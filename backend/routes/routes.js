const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');


router.post('/register', async (req, res) => {
    
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.post('/login', async (req, res) => {
    
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(400).send('Email is not found');
    }

    const validPassword = await bcryptjs.compare(req.body.password, user.password);

    if (!validPassword) {
        return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ _id: user._id }, 'secret');

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    });

    res.send({
        message: 'Logged in',
    });
});

router.get('/user', async (req, res) => {

    const cookie = req.cookies['jwt'];

    if (!cookie) {
        return res.status(401).send('Unauthorized');
    }

    const claims = jwt.verify(cookie, 'secret');

    if (!claims) {
        return res.status(401).send('Unauthorized');
    }

    const user = await User.findOne({ _id: claims._id });

    const { password, ...data } = await user.toJSON();

    res.send(data);
});


router.post('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 0 });

    res.send({
        message: 'Logged out',
    });

});

router.get('/tasks', async (req, res) => {

    const tasks = await Task.find();

    res.send(tasks);
});

router.post('/tasks', async (req, res) => {
    
        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status
        });
    
        try {
            const savedTask = await task.save();
            res.send(savedTask);
        } catch (error) {
            res.status(400).send(error);
        }
    });

router.get('/tasks/:id', async (req, res) => {
        
            const task = await Task.findOne({ _id: req.params.id });
        
            if (!task) {
                return res.status(404).send('Task not found');
            }
        
            res.send(task);
});


router.put('/tasks/:id', async (req, res) => {
        
        const task = await Task.findOne({ _id: req.params.id });

        if (!task) {
            return res.status(404).send('Task not found');
        }

        task.title = req.body.title;
        task.description = req.body.description;
        task.status = req.body.status;

        try {
            const savedTask = await task.save();
            res.send(savedTask);
        }

        catch (error) {
            res.status(400).send
        }

});

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).send('Task not found');
        }

        res.send('Task deleted');
    } catch (error) {
        res.status(400).send({
            message: 'Could not delete task',
            error: error
        });
    }
});

module.exports = router;