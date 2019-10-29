module.exports = Base => class extends Base {

    // Converting data structure to Javascript
    parseEntityData(rawString) {
        let entityStr = rawString.split(' ').map((t) => {
            // ints and bools
            if (/\d+b/.test(t)) return t.replace(/(\d+)b/, '$1');

            // seconds to number
            let secondsReg = /(\d+)s/;
            if (secondsReg.test(t)) return t.replace(secondsReg, '$1');

            //floats / doubles
            if (/\d+\.\d*(d|f)/.test(t)) {
                return t.split('.')
                    .map((str, i) => {
                        if (i === 1) {
                            return str.replace(/(.*)(\d+)(.*)/, '$1 $2 $3')
                                .split(' ')
                                .map(d => /\d+/.test(d) ? d.substr(0, 3) : d)
                                .join('');
                        }
                        return str;
                    }).join('.')
                    .replace(/d|f/, '');
            }

            // Weird L?
            if (/(-{0,1}\d+)L/.test(t)) return t.replace(/(-{0,1}\d+)L/, '"$1"');

            // Default
            return t;
        }).join(' ');

        return eval(`(${entityStr})`);
    }

    getPlayerPosition(playerName) {
        return new Promise((resolve) => {
            const listenForPosition = (data) => {
                let text = data.toString();

                if (!(/has\sthe\sfollowing\sentity\sdata:/).test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForPosition);
                let rawEntityText = text.split('entity data: ')[1];
                let position = this.parseEntityData(rawEntityText);

                resolve(position);
            };

            this.serverProcess.stdout.on('data', listenForPosition);

            this.writeToMine(`data get entity ${playerName} Pos`);
        });
    }

    getPlayerRotation(player) {
        return new Promise((resolve) => {
            const listenForRotation = (data) => {
                let text = data.toString();

                if (!(/has\sthe\sfollowing\sentity\sdata:/).test(text)) return;
                this.serverProcess.stdout.removeListener('data', listenForRotation);
                let rawEntityText = text.split('entity data: ')[1];
                let rotation = this.parseEntityData(rawEntityText);

                resolve(rotation);
            };

            this.serverProcess.stdout.on('data', listenForRotation);

            this.writeToMine(`data get entity ${player} Rotation`);
        });
    }
};