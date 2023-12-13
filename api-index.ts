///////////////////////////////////////////////////////////////////////////////
// lambdaエントリーポイント
///////////////////////////////////////////////////////////////////////////////
import util from "util"
import { Request, Response, DatabaseConnector, Api, getHeader } from "./api-common";

//const dc = new DatabaseConnector()

exports.handler = async (event: Request): Promise<Response> => {

    try {

        const origin = getHeader(event, 'origin');

        let response: Response = {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET,POST",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "no-store",
                "Content-Security-Policy": "frame-ancestors 'none'",
                "Strict-Transport-Security": "max-age=31536000",
                "X-Content-Type-Options": "nosniff",
                "X-Xss-Protection": "1; mode=block",
            },
            body: ""
        }

        // CORS
        if (!!process.env.ORIGIN && process.env.ORIGIN !== origin) {
            throw 'Cross-Origin Request Blocked';
        }

        // OPTIONSはプリフライトリクエストなのでAPIは実行しない
        if (event.httpMethod.toUpperCase() !== 'OPTIONS') {

            // api呼び出しのパスから対応するapiを取得(versionは"v1"等、methodは"mechanism-element"等)
            const path = `./api_${event.httpMethod.toLowerCase()}_${event.pathParameters.function}`;
            const module = await import(path);
            const api = module.default as Api;
            
            // api呼び出し
            event.body = JSON.parse(event.body);
            const ret = await api.exec(event);
            response = { ...response, ...ret };
            response.body = JSON.stringify(response.body);
        }

        // api応答
        return response;

    } catch (ex) {

        const message = `Error!!\nRequest: ${util.inspect(event)}\nException: ${util.inspect(ex)}`
        console.log(message);

        // 例外発生時、400 bad requestで応答
        return {
            statusCode: 400,
            body: 'Bad Request',
        };
    }
};