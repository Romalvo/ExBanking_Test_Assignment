import http from 'k6/http';
import {check,sleep} from 'k6';
import { SharedArray } from 'k6/data';

const usernames = new SharedArray('usernames', function(){
    return open('usernames.csv').split('\n');
});

export const options = {
    stages: [
        {duration: '30s', target: 50},
        {duration: '1m', target: 1000},
        {duration: '30s', target: 0},
    ],
};

export default function () {
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const initial_balance = 1000;

    let createUserRes = http.post('http://localhost:8080/api/create_user',JSON.stringify({
        username: username,
        initial_balance: initial_balance
    }), {headers: {'Content-Type': 'application/json'}});

    const depositData = {username: username, amount: 150};
    const withdrawData = {username: username, amount_to_withdraw: 80};

    
    let res = http.post('http://localhost:8080/api/deposit', JSON.stringify(depositData), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    //console.log(`Deposit request sent for ${username}`);
    //console.log(`Deposit response status for ${username}: ${res.status}`); For debugging purposes.

    
    check(res, {
        'deposit status is 200': (r) => r.status === 200,
        'deposit response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    
    
    res = http.post('http://localhost:8080/api/withdraw', JSON.stringify(withdrawData), {
        headers: { 'Content-Type': 'application/json' },
    });

    //console.log(`Withdraw request sent for ${username}`);
    //console.log(`Withdraw response status for ${username}: ${res.status}`); For debugging purposes

    check(res,{
        'withdraw status is 200': (r) => r.status === 200,
        'withdraw response time < 500ms': (r) => res.timings.duration<500,
    });


     console.log(`Deposit response time for ${username}: ${res.timings.duration}ms`);
     console.log(`Withdraw response time for ${username}: ${res.timings.duration}ms`);
     sleep(1);
}