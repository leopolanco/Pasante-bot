const fs = require('fs');
const path = require('path');
const util = require('util');

const { Message } = require('discord.js');

const messages = require('../messages/despedir');
const flow = require('../../utils/flow');
const random = require('../../utils/random');
const botUtils = require('../../utils/bot');

/**
 * Lista de alias válidos para el comando
 * 
 * @return { Array<string> }
 */
const aliases = () => {
    return ['despedir', 'despido'];
};

/**
 * Información sobre el comando
 * 
 * @return { Object }
 */
const help = () => {
    return {
        "usage": "!despedir",
        "desc": "Despide al pasante de turno.",
        "example": "!despedir"
    }
};

/**
 * Manejador del comando
 * 
 * @param { Message } message Evento completo del mensaje
 */
const main = async (message, userName) => {
    const readDir = util.promisify(fs.readdir);
    const readFile = util.promisify(fs.readFile);

    const avataresFolder = path.join(__dirname, '../../img/avatares');

    const bot = message.client.user;
    
    try {
        const files = await readDir(avataresFolder);

        const randomRambling = messages.fired[random.num(messages.fired.length)];
        const randomIntroduction = messages.introduction[random.num(messages.introduction.length)];

        const images = files.filter(file => {
            const fileParts = file.split('.');
            const extension = fileParts[fileParts.length - 1];

            return extension === 'jpg' || extension === 'png' || extension === 'jpeg';
        });

        let randomAvatar = images[random.num(images.length)];
        randomAvatar = await readFile(`${avataresFolder}/${randomAvatar}`);

        for (const rambling of randomRambling) {
            await botUtils.simulateTyping(message, rambling.replace('__USERNAME__', userName));

            //Aguanta un poco antes del siguiente mensaje
            await flow.sleep(500);
        }

        await bot.setAvatar(randomAvatar);
        
        await flow.sleep(5000);

        await botUtils.simulateTyping(message, randomIntroduction);
    } catch (error) {
        console.log(error);

        const answer = messages.error[random.num(messages.error.length)];

        message.channel.send(answer);
    }
};

module.exports = { aliases, help, main };