import express from 'express'
import { Request, Response } from 'express'
import fs from 'fs/promises'
import cors from 'cors'

const apidir = process.cwd();

process.chdir(apidir);
const backend_api = require('./api-index');

const app: express.Express = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.listen(3001, () => {
    console.log("Start on port 3001")
})

app.all('/testproject/api/:version/:function', async (req: Request, res: Response) => {
    try {
        let event = {}
        let lambda: any = undefined;

        lambda = backend_api;
        process.chdir(apidir);
        event = {
            httpMethod: req.method,
            headers: req.headers,
            pathParameters: req.params,
            body: JSON.stringify(req.body),
        };

        console.log(event)

        lambda.handler(event)
        .then((ret: any) => {
            res.status(ret.statusCode);
            for (let i in ret.headers) {
                res.header(i, ret.headers[i]);
            }
            res.send(ret.body);
            console.log(ret.statusCode)
        })

    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.status(500).send('Internal Server Error');
    }
});

