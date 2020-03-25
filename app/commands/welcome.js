module.exports = Base => class extends Base {
    constructor() {
        super();
        //this allows us to sort the welcome array in the player schema alphabetically and keep default as the first index.
        this.welcomeOptions = {
            'default': 'a',
            'online': 'b',
            'help': 'c',
            'cooldowns': 'd',
            'autostore': 'e',
            'version': 'f',
            'hints': 'z',
            'reset': 'reset'
        };

        this.serverVersion = [
            { text: 'version: 0.66', color: 'green' },
            '\nThis update adds custom welcome messages. type ',
            { text: '!help welcome', color: 'green' },
            ' for more info.\nThis includes a handful of hints aimed to help players discover new features.'
        ];

        this.serverHints = [
            [
                'Waiting around? Check the status of your cooldowns with ',
                { text: '!cooldowns', color: 'green' },
            ],
            [
                'Every command has detailed instructions available when you type ',
                { text: '!help ', color: 'green' },
                { text: 'command', color: 'light_purple' },
            ],
            [
                'Want more homes? You get 2 named personal homes in addition to your default home. Try ',
                { text: '!home set ', color: 'green' },
                { text: 'homeName', color: 'light_purple' },
                '.\nYou want more?! Type ',
                { text: '!help home', color: 'green' },
                ' to learn about shared homes.'
            ],
            [
                'Sharing is caring, share a home with your best friend with ',
                { text: '!home share ', color: 'green' },
                { text: 'playerName', color: 'light_purple' },
            ],
            [
                'Did you know we have special community locations anybody can warp to? type ',
                { text: '!locations', color: 'green' },
                ' for a list.'
            ],
            [
                'Got a long distance relationship in Minecraft? use ',
                { text: '!warp ', color: 'green' },
                { text: 'playerName', color: 'light_purple' },
                ' to teleport to them instantly.'
            ],
            [
                'Its a party! If multiple players try warping to you, you can accept them all at once with ',
                { text: '!warp accept all', color: 'green' },
            ],
            [
                'Feeling like a curmudgion? decline warp requests with ',
                { text: '!warp decline', color: 'green' },
            ],
            [
                'You can customize your welcome message, turn these hints off with ',
                { text: '!welcome hints', color: 'green' },
            ],
            [
                "Want to see who's online first thing? type ",
                { text: '!welcome online', color: 'green' },
            ]
            [
                'Pssst. did you know you can see your welcome message again by typing ',
                { text: '!welcome', color: 'green' },
                '?\nSounds like a good way to read all these clever hints.'
            ],
            [
                'Obtaining a level 30 required enchantment at ',
                { text: 'level 30', color: 'red' },
                ' will cost you 306 points.\nThe same enchantment at ',
                { text: 'level 33', color: 'red' },
                ' will cost you 363 points.\nUse ',
                { text: '!xp check 30', color: 'green' },
                ' to find out how many points you should store before you enchant. Economical!',
            ],
            [
                'The server can automatically store your experience every 30 minutes. Type ',
                { text: '!xp autostore ', color: 'green' },
            ],
            [
                'Are diamonds not enough to express your love? Try gifting experience instead.\n',
                { text: '!xp give ', color: 'green' },
                { text: 'playerName ', color: 'light_purple' },
                { text: '300', color: 'red' },
            ],
            [
                'I heard Josh is hoarding toilet paper.'
            ],
        ]

        this.helpShortDescription.welcome = [
            'Customize the message that greets you when you login. ex: ',
            { text: '!welcome cooldowns', color: 'green' },
        ];

        this.helpFullDescription.welcome = [
            { text: '', color: 'white' },
            { text: '!welcome', color: 'green' },
            ' displays your current welcome message.\n', 
            { text: '!welcome reset', color: 'green' },
            ' resets to the basic message.\n\n',
            { text: 'You may toggle on/off any of the following options.\nAny option toggled on will display when you log in.\n', color: 'white' },
            { text: '!welcome default', color: 'green' },
            ' displays a general welcome message\n',
            { text: '!welcome online', color: 'green' },
            ' lists online players.\n',            
            { text: '!welcome help', color: 'green' },
            ' lists available commands.\n',
            { text: '!welcome cooldowns', color: 'green' },
            ' displays status of command cooldowns.\n',
            { text: '!welcome autostore', color: 'green' },
            ' displays status of your xp autostore.\n',
            { text: '!welcome hints', color: 'green' },
            ' gives a random hint about different server commands.\n',
        ];
    }

    async handleWelcome(playerName, args) {
        if (!args[0]) return await this.displayWelcome(playerName);

        if (args[0] && this.welcomeOptions[args[0]]) {
            await this.toggleInput(playerName, args);
        } else {
            this.handleWrongWelcomeInput(playerName);
        }
    }
    
    async displayWelcome(playerName) {
        //reads welcome array and builds a welcome message out of the componenets.
        let welcomeArray = await this.readPlayerWelcome(playerName);
        let combinedMessage = [
            'Hey ',
            { text: playerName, color: 'aqua' },
            '.',           
        ];

        for (let i = 0; i < welcomeArray.length; i++) {
            let addMessage = [];

            switch(welcomeArray[i]) {
                case 'a':
                    addMessage = this.welcomeDefault()
                    break;
                case 'b':
                    addMessage = await this.welcomeOnline(playerName)
                    break;
                case 'c':
                    addMessage = this.welcomeHelp()
                    break;
                case 'd':
                    addMessage = this.welcomeCooldowns(playerName)
                    break;
                case 'e':
                    addMessage = await this.welcomeAutostore(playerName)
                    break;
                case 'f':
                    addMessage = this.welcomeVersion()
                    break;
                case 'z':
                    addMessage = this.welcomeHints()
            };

            combinedMessage = [...combinedMessage, ['\n'], ...addMessage];
        }
        
        this.tellPlayerRaw(playerName, combinedMessage) 
    }

    async toggleInput(playerName, input) {
        //if input is 'reset' it resets to basic message
        //if input is in welcome array in the player scema, take it out of the array, and vice versa.
        await this.updatePlayerWelcome(playerName, this.welcomeOptions[input]);
        this.tellPlayerRaw(playerName, [
            { text: `Welcome updated.`, color: 'red' },
        ]);
        await this.displayWelcome(playerName);
    }

    handleWrongWelcomeInput(playerName) {
        //they got here by typing the wrong thing, will list the things they can type.
        this.tellPlayerRaw(playerName, [
            { text: `Not a command.\n`, color: 'red' },
            { text: `Type `, color: 'white' },
            { text: `!help welcome`, color: 'green' },
            { text: ` for a list of commands.`, color: 'white' },
        ]);
    }

    welcomeDefault() {
        return [
            'Welcome to the Baert\'s Minecraft server.',
            '\nWe have some custom commands to encourage playing together.\nTry typing',
            { text: ' !help', color: 'green' },
            ' for more information.',
        ];
    }

    async welcomeOnline(playerName) {
        let loggedInPlayers = await this.getListOfOnlinePlayers();
        loggedInPlayers.splice(loggedInPlayers.indexOf(playerName),1);

        if (loggedInPlayers.length > 0) {
            return [
                'Online Players:\n',
                //list all other players online
                ...(loggedInPlayers.map((player) => {
                    return { text: player + '\n', color: 'aqua' };
                })), 
            ]
        }

        return [
            'Nobody else is logged in.',
        ]
    }

    welcomeHelp() {
        return this.basicHelp();
    }

    welcomeCooldowns(playerName) {
        return this.buildCooldownsMessage(playerName);
    }

    async welcomeAutostore(playerName) {
        return await this.xpAutoStoreInform(playerName)
    }

    welcomeVersion() {
        return this.serverVersion
    }

    welcomeHints() {
        let combinedMessage = [
            '',
            { text: "Today's hint:\n", color: 'gold' }
        ];

        const randomHint = this.serverHints[Math.floor(Math.random() * this.serverHints.length)];

        return [...combinedMessage, ...randomHint]
    }
};
