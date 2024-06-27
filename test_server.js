const express = require('express');
const app = express();
const port = 8080;

const users= {
    'testuser': {balance: 1000},
    'user1': {balance: 500},
    'user2': {balance: 1500}
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('api/get_balance', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({error: 'Username is required'})
    }
    const user = users[username];
    if (user) {
        return res.status(200).json({username: username, balance: user.balance});
    } else {
        return res.status(400).json({error: 'User not found'});
    }
});

app.listen(port,  () => {
    console.log('Server running at http://${hostname}:${port}/');
});