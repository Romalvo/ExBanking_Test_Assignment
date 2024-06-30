import http from 'k6/http';
import {check,sleep} from 'k6';
import {SharedArray} from 'k6/data';

const usernames = new SharedArray('usernames', function () {
    return open('usernames1.csv').split('\n');
});

if (usernames.length < 2) {
    throw new Error('Usernames CSV file must contain at least two usernames.');
}


export const options = {
        stages: [
            {duration: '1m', target: 1000},
            {duration: '2m', target: 5000},
            {duration: '1m', target: 0},
        ],
    };
    
export default function () {
    
    let from = usernames[Math.floor(Math.random() * usernames.length)].trim();
    let to;
    do{
        to = usernames[Math.floor(Math.random() *usernames.length)].trim();
    }while(to === from);

    console.log(to);

    

    let payload = JSON.stringify({from: from, to: to, transfer_amount: 200});
    let params = {headers: {'Content-Type': 'application/json'}};
    let res = http.post('http://localhost:8080/api/send', payload, params);

    console.log(`Response status: ${res.status}`);

    check(res, {
        'send status code is 200': (r) => r.status === 200,
        'send response time < 500ms': (r) => r.timings.duration < 500,
    });

    console.log(`Send response time: ${res.timings.duration}ms`);
    sleep(1);
}