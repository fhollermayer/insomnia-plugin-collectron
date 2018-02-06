const fs = require('fs');
const path = require('path');

class Collectron {

    constructor(context) {
        this.context = context;
    }

    static handleResponse(context) {

        const instance = new Collectron(context);

        const json = instance._findJson();

        if (json) {

            console.log("Skrrat, skidi-kat-kat");

            const targetDirectory = instance._mkdir();

            for(const document of json.documents) {

                const filePath = path.join(
                    targetDirectory,
                    `${document.identifier}.txt`
                );

                const content = Buffer.from(document.body, 'base64');

                fs.writeFileSync(filePath, content);
            }
        }
    }

    _findJson() {

        const response = this.context.response;
        const contentType = response.getHeader('Content-Type');

        if (!(contentType && contentType.includes('application/json'))) {
            return false;
        }

        const json = JSON.parse(response.getBody().toString('utf-8'));

        if (!(json && json.origin === 'sprocket')) {
            return false;
        }

        return json;
    }

    _mkdir() {

        const rootDirectory = path.join(
            this.context.app.getPath('desktop'),
            'documents');

        if(!fs.existsSync(rootDirectory)) {
            fs.mkdirSync(rootDirectory);
        }

        const directory = path.join(
            rootDirectory,
            `req_${Date.now().toString()}`);

        if(!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }

        return directory;
    }
}

module.exports.responseHooks = [
    Collectron.handleResponse
];
