import http from 'k6/http';
import{check, sleep} from 'k6';
import {SharedArray} from 'k6/data';

const usernames = new SharedArray ('usernames', function () {
    return open('usernames1.csv'). split('\n').filter(name => name.trim()!== '');
});

export const options = {
    stages: [
        {duration :'30s', target: 100},
        {duration :'30s', target: 500},
        {duration :'30s', target: 1000},
        {duration :'30s', target: 1500},
        {duration :'30s', target: 2000},
        {duration :'1m', target: 2000},
        {duration :'2m', target: 0},
    ],
    thresholds: {
        'http_req_duration': ['p(95) < 2000'],
    },
};

export default function () {
    const username = usernames[Math.floor(Math.random() * usernames.length)].trim();

    
    const createUserPayload = JSON.stringify({ username: username });
    const createUserParams = { headers: { 'Content-Type': 'application/json' } };
    const createUserRes = http.post('http://localhost:8080/api/create_user', createUserPayload, createUserParams);
    check(createUserRes, {
        'create_user status is 200': (r) => r.status === 200,
        'create_user response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    
    const depositPayload = JSON.stringify({ username: username, amount: 100 });
    const depositParams = { headers: { 'Content-Type': 'application/json' } };
    const depositRes = http.post('http://localhost:8080/api/deposit', depositPayload, depositParams);
    check(depositRes, {
        'deposit status is 200': (r) => r.status === 200,
        'deposit response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    
    const withdrawPayload = JSON.stringify({ username: username, amount: 50 });
    const withdrawParams = { headers: { 'Content-Type': 'application/json' } };
    const withdrawRes = http.post('http://localhost:8080/api/withdraw', withdrawPayload, withdrawParams);
    check(withdrawRes, {
        'withdraw status is 200': (r) => r.status === 200,
        'withdraw response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    
    const getBalanceRes = http.get(`http://localhost:8080/api/get_balance?username=${username}`);
    check(getBalanceRes, {
        'get_balance status is 200': (r) => r.status === 200,
        'get_balance response time < 2000ms': (r) => r.timings.duration < 2000,
    });

    sleep(1); 
}