import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from 'firebase/database'
import DiscordJS, { GatewayIntentBits, IntentsBitField } from 'discord.js'
import dotenv from 'dotenv'
import randString from 'randomstring'
dotenv.config()

const client = new DiscordJS.Client({
  intents:[
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessageReactions
  ]
});

const firebaseConfig = {
  apiKey: "AIzaSyCxiGvnMIxYA77qJ758zHLR7QfUIjoPvMw",
  authDomain: "ice-mar.firebaseapp.com",
  databaseURL: "https://ice-mar-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ice-mar",
  storageBucket: "ice-mar.appspot.com",
  messagingSenderId: "613961239911",
  appId: "1:613961239911:web:192a9b729db5051151f3c2"

};


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const prefix = '!alpha';
const ownerID = "421288727659413504";

//Jasons ID : 804567184218128414
// My ID : 421288727659413504
// Matmat ID : 863457330761826334

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(' ');
	let email = args?.shift()?.toLowerCase();
  let randPass = randString.generate(5);
  var canAccess = false;
  let discordName = message.author.tag;

  set(ref(database, '/users/' + message.author.username), {
    email: email,
    pass: randPass,
    discord: discordName,
    canAcc: false
  });
  
  message.reply(discordName + " your request for alpha version of Ice Martians has been sent!");
  
  client.users.fetch(ownerID).then((user) => {
  const DMsent = user.send('New alpha tester! \nEmail: ' + email + '\nDiscord username: ' + discordName + '\nShould he get access to the alpha version?').then(function (message){
      message.react("👍");
      message.react("👎");

      const filter = (reaction, user) =>{
        return (reaction.emoji.name == '👍' && reaction.count > 1) || (reaction.emoji.name == '👎' && reaction.count > 1)
      };
  
      message.awaitReactions({filter, max: 1}).then(collected => {
      const reaction = collected.first();

      let newDisName = discordName;
      newDisName = newDisName.substring(0, newDisName.length - 5);
      
      if (reaction.emoji.name === '👍') {
        message.reply('You have approved ' + email);

        let randPass = randString.generate(5);

        const new_user = client.users.cache.find(user => user.username == newDisName).id;

        client.users.fetch(new_user).then((user) => {
          const DMsent = user.send("Good news, You have been accepted to the Ice Martians alpha version!\nYour login cradentials are:\nEmail: " + email + "\nPassowrd: " + randPass);
        });

        set(ref(database, '/users/' + newDisName), {
          email: email,
          pass: randPass,
          discord: discordName,
          canAcc: true
        });

      } else if(reaction.emoji.name === '👎') {
        message.reply('You denied ' + email);

        set(ref(database, '/users/' + newDisName), {
          email: email,
          pass: randPass,
          discord: discordName,
          canAcc: false
        });

      }
     })

  });


  });
});

client.on('messageReactionAdd', (reaction, user) => {
  console.log('a reaction has been added');
});




//----------------------------------

client.on('ready', () =>{
    console.log("The bot is online!")
})

client.login(process.env.TOKEN)