const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;

app.use(express.json());

const users = {};


app.post('/api/create_user', (req, res) => {
    const {username, initial_balance} = req.body;
    if (users[username]) {
        return res.status(400).json({message: 'User already exists'});
    }
    const parsedBalance = parseFloat(initial_balance);
    const balance = !isNaN(parsedBalance) && parsedBalance > 0 ? parsedBalance : 0;

    users[username] = {balance: balance};

    return res.status(201).json({message: 'User created successfully', username});
});

app.get('/api/get_user', (req, res) => {
    const {username} = req.query;
    const user = users[username];
    if (!user) {
        return res.status(400).json({message: 'User not found'});
    }
    return res.status(200).json({username, ...user});
});

app.post('/api/deposit', (req, res) => {
    const {username, amount} = req.body;
    const user =users[username];
    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount<=0) {
        return res.status(400).json({message: 'Deposit amount should be positive'});
    }
    user.balance += parsedAmount;
    return res.status(200).json({message: 'Deposit successful', balance: user.balance});
});

app.post('/api/withdraw', (req, res) => {
    const {username, amount_to_withdraw} = req.body;
    const user = users[username];


    if (!user) {
        return res.status(404).json({message: 'User not found'});
    }


    const parsedAmount = parseFloat(amount_to_withdraw);
    if (isNaN(parsedAmount) || parsedAmount<=0 ) {
        return res.status(400).json({message: 'Invalid amount'});
    }

    if (user.balance < parsedAmount) {
        return res.status(400).json({message: 'Insufficient funds'});
    }

    user.balance -= parsedAmount;
    return res.status(200).json({message: 'Withdrawal successful', balance: user.balance});
});

app.get('/api/get_balance', (req, res) =>{
    const {username} = req.query;
    const user = users[username];
    if (!users[username]) {
        return res.status(404).json({message: 'User not found'});
    }
    return res.status(200).json({balance: users[username].balance});
});

app.post('/api/send', (req, res) => {
    const {from, to, transfer_amount} = req.body;
   
    
    if (!users[from]) {
        return res.status(404).json({message: 'Sender not found'});
    }
    if (!users[to]) {
        return res.status(404).json({message: 'Recipient not found'});
    }
    if (transfer_amount <= 0) {
        return res.status(400).json({message: 'Invalid amount'});
    }
    if (users[from].balance < transfer_amount) {
        return res.status(400).json({message: 'Insufficient funds'});
    }
    users[from].balance -= transfer_amount;
    users[to].balance += transfer_amount; 
    return res.status(200).json({message: 'Transfer successful'});
    });

app.listen(port,  () => {
    console.log(`Server running at http://localhost:${port}/`);
});