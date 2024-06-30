import http from 'k6/http';
import {check,sleep} from 'k6';
import {SharedArray} from 'k6/data';

const usernames = new SharedArray('usernames', function(){
    return open('usernames1.csv').split('\n');
});

export const options = {
    stages: [
        {duration: '1m',target: 1000},
        {duration: '2m',target: 10000},
        {duration: '2m',target: 0},
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    },
};

export default function () {
    const username = usernames[Math.floor(Math.random() * usernames.length)];
       

    const url = `http://localhost:8080/api/get_balance?username=${username}`;
    const res = http.get(url);

    console.log(`get balance response: ${res.status} ${res.body}`);

    check(res,{
        'is status code 200': (r) =>r.status === 200,
        'get balance response time < 500ms': (r) => r.timings.duration < 500,
    });

    console.log(`Response time for {${username}: ${res.timings.duration}ms`);
    sleep(1);
}
