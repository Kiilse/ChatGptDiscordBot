require('dotenv/config')

const { Client, IntentsBitField} = require('discord.js');
const {Configuration, OpenAIApi} = require('openai');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

client.on('ready', () => {
    console.log("The bot is online");
    console.log(process.env.CHANNEL_ID);
})

const configuration = new Configuration({
    apiKey: process.env.GPT_TOKEN,
})
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
    
    if (message.content.startsWith('!setGPTChannel')) {        
        process.env.CHANNEL_ID = message.channelId; 
        console.log("ChannelId set");       
        return;
    };
    
    if (process.env.CHANNEL_ID == null) {
        return
    };
    
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;
    if (message.content.startsWith('!')) return;

    let conversationLog = [{role: 'system', content: "You are a friendly chatbot"}];

    conversationLog.push({
        role: 'user',
        content: message.content,
    });

    await message.channel.sendTyping();

    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog
    })

    message.reply(result.data.choices[0].message);

})

client.login(process.env.DISCORD_TOKEN);