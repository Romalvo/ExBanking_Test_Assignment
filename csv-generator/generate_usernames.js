const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const {v4: uuidv4} = require('uuid');

function generateRandomUsername() {
    return 'user_' + uuidv4().replace(/-/g, '').slice(0,8);
}
const csvwriter = createCsvWriter({
    path: 'usernames.csv',
    header: [
        {id: 'username', title: 'USERNAME'},
    ],
})

const records = [];
for (let i =0; i<10000; i++) {
    records.push({username: generateRandomUsername()});
}

csvwriter.writeRecords(records)
    .then(() =>{
        console.log('CSV file created successfully.');
    })
    .catch(err => {
        console.error('Error writing CSV file: ', err);
    });