import http from 'k6/http';
import {check, sleep} from 'k6';
import {SharedArray} from 'k6/data';

const usernames = new SharedArray('usernames', function () {
    const csvData = open('usernames1.csv');
    if (!csvData) {
        throw new Error('Failed to load usernames from CSV file.');
    }
    return csvData.split('\n').filter(name => name.trim() !== '');
});

export const options = {
    stages: [
        {duration: '30s', target: 1100},
        {duration: '1m', target: 1100},
        {duration: '30s', target: 0},
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
};

export default function () {
    const url = 'http://localhost:8080/api/create_user';
    const username = usernames[Math.floor(Math.random()*usernames.length)];
    const payload = JSON.stringify({username: username, initial_balance: "50"});
    const headers = { 'Content-Type': 'application/json'};
    const res = http.post(url, payload, {headers});

    //console.log(`Sending request for username: ${username}`);
    //console.log(`Response for ${username}: ${JSON.stringify(res,null,2)}`);
    
    if(!res) {
        console.error('HTTP request failed');
        return;
    }
    check(res,{
        'is status code 201' : (r) => r.status === 201,
        'User create response time < 500ms': (r) => res.timings.duration<500,
        'is status code 400' : (r) => r.status === 400, //if user with the same username already exist.
    });
    //console.log(`Response time for ${username}:${res.timings.duration}ms`);
    sleep(1);
}