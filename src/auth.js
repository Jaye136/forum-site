import fs from 'fs';
import path from 'path';

// loading existing users
const userMap = new Map();
const userFile = path.resolve('users.tsv');

// Code credits (6 lines): https://www.geeksforgeeks.org/node-js/node-js-fs-readfile-method/
const userList = fs.readFile(userFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error occured while reading users.tsv.', err);
        return;
    } else {
        console.log('users.tsv loaded successfully.');

        userList.split('\n'); // array where each entry is one row

        while (userList.length() > 1) { // iterate through rows, ignoring the first (column labels)
            let userInfo = userList.pop();
            userInfo.split('\t');
            userMap.set(userInfo[0], new User(userInfo[0], userInfo[1], userInfo[2]));
        }
    }
});