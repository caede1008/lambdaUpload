import { Request, Response, Api, DatabaseConnector, getLang } from "./api-common";
import fs from "fs";


export default new class implements Api {

    async exec(req: Request, dc?: DatabaseConnector): Promise<Response> {
        console.log('api到達')
		// JSONファイルの内容をそのまま返す
		const jsonFilePath = `./json/api_v1_player.json`
		const text = await fs.promises.readFile(jsonFilePath, { encoding: 'utf-8' })
        return {
            statusCode: 200,
            body: JSON.parse(text)
        };
    }
}