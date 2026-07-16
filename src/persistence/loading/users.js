import fs from 'fs';
import path from 'path';

// loading existing users
// readfile and not readstream because users.tsv only needs to be loaded once per session
const userMap = new Map();
const userFile = path.resolve('users.tsv');

// Code Credits (async & trycatch template): https://nodejs.org/learn/manipulating-files/reading-files-with-nodejs
// self note: function() becomes defined in order of read, funtion = function() {} becomes defined when called
// function1(); function1 = function() { definition } => invalid || function expression
// function2(); funtion2() { definition } => (call position before define position) valid || function declaration
async function loadUsers() {
    try {
        const userData = await fs.readFile(userFile, 'utf8');
        console.log('users.tsv loaded successfully.');

        const userList = userData.split('\n'); // array where each entry is one row

        while (userList.length > 1) { // iterate through rows, ignoring the first (column labels)
            let userInfo = userList.pop();
            userInfo = userInfo.split('\t');
            userMap.set(userInfo[0], new User(userInfo[0], userInfo[1], userInfo[2]));
        }
    } catch (err) {
        console.error('Error occurred while reading users.tsv.', err);
    }
}

// // create writestream to enable writing additions to the user list
// // writestream and not writefile because multiple users may register per session
// for personal future reference: https://nodejs.org/api/fs.html#file-system-flags
function connectStream() {
    const userWrite = fs.createWriteStream(userFile, 'utf8', { flags: 'r+', start: Number.MAX_SAFE_INTEGER });

    userWrite.on('ready', () => {
        console.log('writeStream connection with users.tsv secured.');
    });

    userWrite.on('error', err => {
        userWrite.destroy(); // since previous writestream is faulty (don't keep it)
        if (err.code == 'ENOENT') {
            console.error('users.tsv is misplaced or has been deleted. Creating another...');
            fs.writeFile(userFile, 'username\tpassword\tpermissions', 'utf8', err => {
                if (err) {
                    console.error('users.tsv errors could not be resolved.', err);
                    process.exit(1);
                } else {
                    console.log('Successfully created users.tsv. Attempting to reconnect write stream to users.tsv...');
                    connectStream(); // recurse back now that users.tsv exists and is correctly set up with labels
                }
            });
        } else {
            console.error('writeStream connection with users.tsv could not be secured.', err);
            process.exit(1);
        }
    });
}