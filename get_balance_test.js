import http from 'k6/http';
import {check,sleep} from 'k6';
import {SharedArray} from 'k6/data';

const usernames = new SharedArray('usernames', function(){
    return open('usernames.csv').split('\n');
});

export const options = {
    stages: [
        {duration: '1m',target: 1000},
        {duration: '3m',target: 10000},
        {duration: '1m',target: 0},
    ],
};

export default function () {
    const username = usernames[Math.floor(Math.random() * usernames.length)];
    const url = 'http://localhost:8080/api/get_balance?username=${username}';
    const res = http.get(url);
    check(res,{
        'is status code 200': (r) =>r.statusCode === 200,
    });

    console.log('Response time for {${username}: ${res.timings.duration}ms');
    sleep(1);
}
