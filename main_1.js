const axios = require('axios');
const Discord = require('discord.js');

// Check if the config exists
try {
  var options = require('./config/config_1').options;
} catch(error) {
  console.log('\x1b[41m%s\x1b[0m', '\nMake sure you copy/rename config.js.example to config.js!\n');
}

// Create Discord client instance
const client = new Discord.Client();

/**
 * Get the price information from API
 */
const getPairs = async url => {
  try {
    return await axios.get(`${url}`, { responseType: 'json', timeout: 10000 });
  } catch(e) {
    console.log(e);
  }
};


/**
 * Connect to Discord
 */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!\nUse https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=67176464&scope=bot to authorize your bot for your server.\n`);
  client.user.setActivity(`bot starting....❤❤`);
  updateTopic();
  // Poll the servers every X seconds
  client.setInterval(updateTopic, options.pollRate * 1000);
});

/**
 * Update the topic
 */
const updateTopic = async () => {
  
  const prices = [];
  let coin = '', tsym = '';
  let sign = '', direction = '';
  let pairs;
  
  let currencies = await options.currencies;
  let exchange = await options.exchange;

  
  //console.log(current);
  // Fetch every pair  
  if (exchange==undefined || exchange==null || exchange==""){       
      pairs = await getPairs(`${options.api}?fsyms=${options.pairs.join(',')}&tsyms=${options.currencies.join(',')}`); 
  }else{      
      pairs = await getPairs(`${options.api}?fsyms=${options.pairs.join(',')}&tsyms=${options.currencies.join(',')}&e=${options.exchange}`);
  }
  
  
  for (const f in pairs.data.RAW) {
    for (var i = 0; i < currencies.length; i++) {
        coin = await pairs.data.RAW[f][currencies[i]];        
        if (coin.CHANGE24HOUR > 0) {
          sign = '+';
          direction = '🐮';
        } else if (coin.CHANGE24HOUR < 0){
          sign = '';
          direction = '🐼';
        } else{
          sign = '';
          direction = '';
        }
        prices.push(` ${coin.FROMSYMBOL}: ${coin.PRICE} (${sign}${+(coin.CHANGEPCT24HOUR).toFixed(2)}% ${direction}) `);
    }
       
 } 
  //let topic = await prices.join(' | ');
  let current = new Date();
  let timeStamp = await calcTime(current,-5); 
  //console.log(timeStamp);


  client.on('message', message => {
    if (message.content.toLowerCase().includes('change') || message.content.toLowerCase().includes('update') || message.content.toLowerCase().includes('choochoo')){
      if (exchange==undefined || exchange==null || exchange=="" || exchange=='CCP' || exchange=='CryptoCompare'){
        message.guild.me.setNickname(`Crypto Compare | ${gDate(timeStamp)}`);
      }else {
        message.guild.me.setNickname(`${exchange} | ${gDate(timeStamp)}`);
      }
    }
  });
  

  client.user.setPresence({
    activity: {
      name: `${prices} | ${options.currencies.join(',')} | ${gTime(timeStamp)}`,      
      type: 'WATCHING'
    },
  });
}

function gDate(timeStamp){
  let current =  new Date(timeStamp);
  let day,month;
  current.getDate() < 10    ? day    = '0'+ current.getDate()         : day = current.getDate();
  current.getMonth() < 9    ? month  = '0'+ (current.getMonth() + 1)  : month = current.getMonth() + 1;
  return day.toString() + '.' + month.toString() + '.' + current.getFullYear().toString();
}

function gTime(timeStamp){
  let current =  new Date(timeStamp);  
  let second,minute,hour;
  current.getHours() < 10   ? hour   = '0'+ current.getHours()        : hour = current.getHours();
  current.getMinutes() < 10 ? minute = '0'+ current.getMinutes()      : minute = current.getMinutes();
  current.getSeconds() < 10 ? second = '0'+ current.getSeconds()      : second = current.getSeconds();
  return  hour + ":" + minute + ":" + second;
}

function gTimeStamp(timeStamp){
  let current =  new Date(timeStamp);
  let day,month,second,minute,hour;
  current.getDate() < 10    ? day    = '0'+ current.getDate()         : day = current.getDate();
  current.getMonth() < 9    ? month  = '0'+ (current.getMonth() + 1)  : month = current.getMonth() + 1;
  current.getHours() < 10   ? hour   = '0'+ current.getHours()        : hour = current.getHours();
  current.getMinutes() < 10 ? minute = '0'+ current.getMinutes()      : minute = current.getMinutes();
  current.getSeconds() < 10 ? second = '0'+ current.getSeconds()      : second = current.getSeconds();
  return day + '.' + month + '.' + current.getFullYear() + ' ' + hour + ":" + minute + ":" + second;
}

function calcTime(timeStamp ,offset) {

  // create Date object for current location
  let d =  new Date(timeStamp);  
 
  // convert to msec
  // add local time zone offset
  // get UTC time in msec
  let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
 
  // create new Date object for different city
  // using supplied offset
  let nd = new Date(utc + (3600000*offset));
 
  // return time as a string
  return nd.toLocaleString();

}
//console.log(calcTime(current,-5));

// Log in
client.login(options.token);
