/**
 * @name shrt
 * @description Stupid simple no-deps url-shortner
 * @author Michael Vieira
 * @license MIT
 *
 * This project have for goal, purposing a stupid simple url-shortner using
 * only the standard library purpose and a easy way to deploy it in production.
 */

const fs = require('fs');
const http = require('http');

const config = require('./config');

const HTTP_BIND = process.env.HTTP_BIND || config.httpBind || '::';
const HTTP_PORT = process.env.HTTP_PORT || config.httpPort || 8090;
const SERVER_URI =
    process.env.SERVER_URI ||
    config.serverUri ||
    `http://${HTTP_BIND}:${HTTP_PORT}`;

const DB_FILE = './db.json';

// Generate DB file if not exists
bootstrapDatabase();

// Create the Web server
const server = http.createServer(async (req, res) => {
    if (req.method == 'GET' && req.url == '/') {
        res.end(
            'shrt: Stupid simple no-deps url-shortner is running here. ' +
                'Available on: https://github.com/themimitoof/shrt\n'
        );
    } else if (req.method == 'POST' && req.url == '/') {
        let body = [];

        if (!'apikey' in req.headers || req.headers.apikey != config.apikey) {
            res.statusCode = 403;
            return res.end('Apikey invalid.\n');
        }

        req.on('data', chunk => body.push(chunk)).on('end', () => {
            body = Buffer.concat(body).toString();
            body = JSON.parse(body);

            if (!('link' in body)) {
                res.statusCode = 400;
                return res.end(
                    '"link" parameter not present in the body of the ' +
                    'request.\n'
                );
            }

            // Check if the link already exists or not for avoid duplicates
            const db = readDatabase();
            Object.keys(db).forEach(key => {
                if (db[key] == body['link']) {
                    const slug = key;
                    return res.end(`${SERVER_URI}/${slug}\n`);
                }
            });

            // Add the link to the database
            const slug = generateSlug();
            db[slug] = body.link;
            saveDB(db);

            res.statusCode = 201;
            return res.end(`${SERVER_URI}/${slug}\n`);
        });
    } else if (req.method == 'GET' && req.url.match(/^\/[a-z0-9]+$/gi)) {
        const slug = req.url.substring(1);
        const db = readDatabase();

        if (!(slug in db)) {
            res.statusCode = 404;
            return res.end('Link not found.\n');
        }

        res.statusCode = 301;
        res.setHeader('Location', db[slug]);
        return res.end();
    } else {
        res.statusCode = 404;
        res.end('Not found\n');
    }
});

server.listen(HTTP_PORT, HTTP_BIND, () => {
    console.info(
        `Shrt server started and listening on ${HTTP_BIND}:${HTTP_PORT}`
    );
});

function bootstrapDatabase() {
    console.log('Check if the DB file exists or not.');
    if (!fs.existsSync(DB_FILE)) {
        console.info('File not found, creating it...');
        fs.writeFileSync(DB_FILE, '{}');
    } else {

        console.log('DB file already exists!');
    }
}

function readDatabase() {
    const db = fs.readFileSync(DB_FILE, { flag: 'r', encoding: 'utf-8' });

    // If the database is empty, return an empty object
    return (db !== '') ? JSON.parse(db) : {};
}

function generateSlug() {
    return Math.random().toString(36).slice(2);
}

function saveDB(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
