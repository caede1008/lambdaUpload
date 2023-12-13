import express from 'express'

const apidir = process.cwd();
process.chdir(apidir);

const backend_api = require('./api-index')

const app: express.Express = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(3001, () => {
    console.log("Start on port 3001")
})

app.all('/testproject/api/:version/:function', (req: express.Request, res: express.Response) => {
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

    lambda.handler(event)
        .then((ret: any) => {
            res.status(ret.statusCode);
            for (let i in ret.headers) {
                res.header(i, ret.headers[i]);
            }
            res.send(ret.body);
        })
        .catch((ex: any) => res.status(400).json(ex));
})


const test = () => {
    console.log('test')
}

test()