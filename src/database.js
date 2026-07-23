import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// createpool not createconnection in case 10 trillion users appear out of nowhere and all try to join at once
export const connectionPool = mysql.createPool({
    // was concerned about having a hardcoded password in the files but learned there was a solution for that!!
    // source: https://youtu.be/Hej48pi_lOc?si=FUXnQmB_G0MjsEJT
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    timezone: '+00:00', // always force use UTC on default just in case
    multipleStatements: true
});

export async function loadSchema() {
    const sqlPath = path.join(process.cwd(), 'schema.sql');
    const schema = await fs.readFile(sqlPath, 'utf8');
    await connectionPool.query(schema);
}

export async function testStuff() {
    // await connectionPool.query("DROP TABLE users");
    // await connectionPool.query("DROP TABLE posts");
    // await connectionPool.query("DROP TABLE comments");
    // await connectionPool.query("CALL registerUser('testuser0', 'tuser0', '00000000', 'member')");
    // await connectionPool.query("CALL addPost('lorsum', 'lorem ipsum', '00000000', NOW(), '00000000', 'active')");
    // await connectionPool.query("CALL addPost('ipum', 'lorem ipsum', '00000000', NOW(), '00000001', 'active')");
    // await connectionPool.query("CALL addPost('AAAAAAAAAAAAA', 'BBBBBBBBBBBBBBBBBBB', '00000000', NOW(), '00000002', 'active')");
    // await connectionPool.query("CALL addPost('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB BBBB BBBBBBBBBBBBB BBBBBBBBBBBBBBBBBBBBBBB', '00000000', NOW(), '00000003', 'active')");
    // await connectionPool.query("CALL addComment('EEEEEEEEEEEE', '00000000', NOW(), 'active', '00000000', 'p00000002')");
    // await connectionPool.query("CALL addComment('AAA', '00000000', NOW(), 'active', '00000001', 'p00000002')");
    // await connectionPool.query("CALL addComment('sSDDSD', '00000000', NOW(), 'active', '00000002', 'c00000000')");
    // await connectionPool.query("CALL addComment('sdasdasd', '00000000', NOW(), 'active', '00000003', 'c00000000')");
    // await connectionPool.query("CALL addComment('dffsf', '00000000', NOW(), 'active', '00000004', 'p00000002')");
    // await connectionPool.query("CALL addComment('fddfdffddf', '00000000', NOW(), 'active', '00000005', 'p00000002')");
    // await connectionPool.query("CALL addComment('sdndnnds', '00000000', NOW(), 'active', '00000006', 'c00000000')");
}