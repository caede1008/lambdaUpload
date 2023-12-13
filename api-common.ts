///////////////////////////////////////////////////////////////////////////////
// apiの共通処理等を定義するファイル
///////////////////////////////////////////////////////////////////////////////

import { ClientConfig, Pool, PoolClient } from "pg"

// lambdaの引数（プロキシ統合に準拠。プロキシ統合について https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html）
export type Request = {
    // メソッド
    httpMethod: string;
    // httpヘッダ
    headers: any;
    // パスパラメータ
    pathParameters: {
        function: string;
    };
    // ステージ変数
    stageVariables: {
        dbPrefix: string;
    }
    // リクエストボディ
    body: any;
}

// lambdaの応答（プロキシ統合に準拠。プロキシ統合について https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html）
export type Response = {
    // httpステータスコード
    statusCode: number;
    // ヘッダ
    headers?: any;
    // レスポンスボディ
    body: any;
}

// mselectApiインターフェイス
export type Api = {
    // API実行
    exec(req: Request, dc?: DatabaseConnector): Promise<Response>;
}

// HTTPヘッダ取得
export function getHeader(req: Request, field: string): string | undefined {
    field = field.toLowerCase();
    for (const i in req.headers) {
        if (i.toLowerCase() === field) {
            return req.headers[i] as string;
        }
    }
    return undefined;
}

// 言語取得
export function getLang(req: Request): string {
    return getHeader(req, 'accept-language')?.substring(0, 2) ?? "jp";
}

// 言語は日本？
export function isJp(req: Request): boolean {
    return getLang(req) === 'jp'
}

// DB接続クラス
export class DatabaseConnector {

    private _poolHash: { [key: string]: Pool } = {}
    private _config = require("config").dbConnect as ClientConfig;

    // 言語別DBの接続を取得
    public async connectByRequest(req: Request): Promise<PoolClient> {
        return this.connect({ database: (req.stageVariables?.dbPrefix ?? "") + "mselect_" + getLang(req) })
    }

    // 任意のDB接続を取得
    public async connect(conf: ClientConfig): Promise<PoolClient> {
        const con = { ...this._config, ...conf }
        const key = `${String(con.host)}_${String(con.port)}_${String(con.database)}_${String(con.user)}`
        if (!this._poolHash[key]) {
            this._poolHash[key] = new Pool(con)
        }
        return this._poolHash[key].connect()
    }
}