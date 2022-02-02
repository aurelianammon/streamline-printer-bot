require('dotenv').config()
const cors = require('cors')
const aposToLexForm = require('apos-to-lex-form');
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');
const storage = require('node-persist');
const { Telegraf } = require('telegraf')

const express = require('express');
const natural = require('natural');

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

(async function() {
    await storage.init()
    // console.log(await storage.getItem('chat_list'))
    console.log('Storage initiated.')
    return 1
})().then(function() {
    loop()
});

var messages = []
var sentiment = [0, 0, 0, 0, 0]
var sent_length = [1, 1, 1, 1, 1]

const bot = new Telegraf(process.env.BOT_TOKEN)
const app = express();
app.use(cors());

var chat_list = []

bot.command('start', async (ctx) => {
    // console.log(ctx.from)
    const data = await storage.getItem('chat_list')
    // console.log(data)
    if (!data.includes(ctx.chat.id)) {
        data.push(ctx.chat.id)
        await storage.setItem('chat_list', data)
        bot.telegram.sendMessage(ctx.chat.id, 'Welcome to this conversation. Send /stop to halt this conversation. Your ID is ' + ctx.chat.id, {})
    }
    bot.telegram.sendMessage(ctx.chat.id, 'Hello there! Send me a message or just wait to see what happens.', {})
})

bot.command('stop', async (ctx) => {
    console.log(ctx.from)
    const data = await storage.getItem('chat_list')
    if (data.includes(ctx.chat.id)) {
        await storage.setItem('chat_list', data.filter(chat => chat !== ctx.chat.id))
        bot.telegram.sendMessage(ctx.chat.id, 'This conversation has been stopped. Send /start to restart this conversation.', {})
    }
})

bot.command('stats', async (ctx) => {
    const data = await storage.getItem('chat_list')
    bot.telegram.sendMessage(ctx.chat.id, "Active conversations: " + data, {
    })
})

bot.command('reset', async (ctx) => {
    sentiment = [0, 0, 0, 0, 0]
    sent_length = [1, 1, 1, 1, 1]
    bot.telegram.sendMessage(ctx.chat.id, 'done', {
    })
})

// Default response
bot.on('text', async (ctx) => {
    messages.push(ctx.message.text)

    const lexedReview = aposToLexForm(ctx.message.text);
    const casedReview = lexedReview.toLowerCase();
    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

    const { WordTokenizer } = natural;
    const tokenizer = new WordTokenizer();
    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);

    tokenizedReview.forEach((word, index) => {
        tokenizedReview[index] = spellCorrector.correct(word);
    })

    const filteredReview = SW.removeStopwords(tokenizedReview);

    const { SentimentAnalyzer, PorterStemmer } = natural;
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    var analysis = analyzer.getSentiment(filteredReview);

    if (isNaN(analysis)) {
        analysis = 0
    }

    analysis = analysis * 1.5

    // add to array
    sentiment.pop()
    sentiment.unshift(analysis)
    sent_length.pop()
    sent_length.unshift(tokenizedReview.length)

    console.log(calculateAverage(sentiment) + "/" + calculateAverage(sent_length))

    // CREATE DIFFERENT RETURN MESSEGES HERE
    var return_messages = [
        // 'nice 👍',
        // 'thx',
        // 'cool cool cool',
        "Thank you for sharing. Would you like to tell more?",
        "It is nice that you talked about your feelings.",
        "Sometimes it is hard to verbalise it's own thoughts, thanks!"
    ]
    var random_message = Math.floor((Math.random() * return_messages.length))

    bot.telegram.sendMessage(ctx.chat.id, return_messages[random_message], {
    })
})

function calculateAverage(array) {
    var total = 0;
    var count = 0;

    array.forEach(function(item, index) {
        total += item;
        count++;
    });

    return total / count;
}

app.get('/sentiment', (req, res) => {
	return res.send({ 
        sentiment: calculateAverage(sentiment),
        lenght: calculateAverage(sent_length)
    });
});

app.listen(8888, () =>
	console.log('Example app listening on port 8888!'),
);

bot.launch();

function runProgress(id) {
    var random_question = Math.floor((Math.random() * question_list.length))
    bot.telegram.sendMessage(id, question_list[random_question], {})
}

async function loop() {
    // THE DELAY DEFINES THE TIME TO WAIT FOR THE NEXT QUESTION
    var delay = 30 // <------------ HERE
    const data = await storage.getItem('chat_list')
    data.forEach(runProgress)
    setTimeout(loop, delay * 1000);
}

// THIS IS THE LIST OF QUESTIONS, ASKED IN RANDOM ORDER
var question_list = [
    "Could you tell me about any times over the past few months that you've been bothered by low feelings, stress, or sadness?",
    "How frequently have you had little pleasure or interest in the activities you usually enjoy? Would you tell me more?",
    "How frequently have you been bothered by not being able to stop worrying?",
    "Tell me about how confident you have been feeling in your capabilities recently.",
    "Can you tell me about your hopes and dreams for the future? What feelings have you had recently about working toward those goals?",
    "Let's discuss how you have been feeling about your relationships recently.",
    "Tell me about any important activities or projects that you've been involved with recently. How much enjoyment do you get from these?",
]