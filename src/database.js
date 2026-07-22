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
    // await connectionPool.query("CALL addPost('AAAAAAAAAAAAA', 'BBBBBBBBBBBBBBBBBBB', '00000000', NOW(), '00000002', 'active')");
}