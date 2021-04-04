// CamelOtter by jkcoxson
// Long live Camels

const Discord = require("discord.js");
const fs = require('fs');
const net = require('net');

//Read in some values
const config = require('./config.json');
let ban = require('./ban.json');


//Let's make some variables
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const prefix = config.prefix;

client.on("guildMemberAdd",(member)=>{
    console.log(member+" joined.");
    discordSend("Welcome <@"+member+">. Go to <#"+config.rules+"> to read the rules and react with the otter emoji to accept them.",config.welcome);
    
});
client.on("message",(message)=>{
    if (message.author.bot){
        return;
    }
    for (let i = 0; i<config.ban.length; i++){
        if(message.content.toLowerCase().includes(config.ban[i].toLowerCase())){
            try {
                message.delete().catch((err)=>{console.log(err)});
            }catch{

            }
            message.reply("stop that propaganda!")
        }
    }
    if (message.content.toString().toLowerCase()=="good bot"){
        message.reply("I know I am");
    }
    if (message.content.toString().toLowerCase()=="no u"){
        message.reply("no u");
    }
    if (message.content.toString().toLowerCase()=="no you"){
        message.reply("no you");
    }
    if (message.content.startsWith(config.prefix)){
        message.reply(commandRunner(message.content.substr(1,message.content.length),message));
    }
    if (message.content.includes("<!@"+client.user.id.toString()+">")){
        message.reply(commandRunner(message.content,message));
    }
    
})


function commandRunner(message,context=null){
    if (message.startsWith("ban")){
        try {
            if (!arrayMatch(context.member.roles.cache,config.admins)){
                return("you must be an admin to run this command.")
            }
        }catch(err){
            console.log(err)
            return("you must be an admin to run this command.")
        }
        
        config.ban.push(message.substr(4,message.length));
        saveJSON();
        return("added "+message.substr(4,message.length)+" to the propoganda list.")
    }
    if (message.startsWith("unban")){
        try {
            if (!arrayMatch(context.member.roles.cache,config.admins)){
                return("you must be an admin to run this command.")
            }
        }catch(err){
            console.log(err)
            return("you must be an admin to run this command.")
        }
        config.ban.splice(config.ban.indexOf(message.substr(6,message.length)),1);
        saveJSON();
        return("unbanned "+message.substr(6,message.length))
    }
    if (message.startsWith("text filter add")){
        //console.log(context.member.roles.cache)
        if (!arrayMatch(context.member.roles.cache,config.admins)){
            return("you must be an admin to run this command.")
        }
        config.imageChats.push(context.channel.id.toString())
        saveJSON();
        return("added <#"+context.channel.id+"> to the image channels.")
    }
    if (message.startsWith("help")){
        return("ha ha no.")
    }
    
 



    return("command not found.")
    
}

function discordSend(message,channel){
    client.channels.cache.get(channel).send(message)
}

setInterval(async()=>{
    client.channels.cache.forEach(async(element) => {
        //console.log(element)
        if (config.imageChats.includes(element.id.toString())){
            element.messages.fetch().then(messages =>{
                messages.forEach(msg => {
                    
                    if(msg.attachments.size>0){
                        //console.log("has an image, skip")
                        return; 
                    }
                    //console.log((Math.floor(new Date().getTime()))-(msg.createdTimestamp))
                    if ((Math.floor(new Date().getTime()))-(msg.createdTimestamp)>300000){
                        //console.log("message found, destroy")
                        try {
                            msg.delete().catch(()=>{
                                //do nothing
                            });
                        }catch{

                        }
                        
                    }
                    //console.log(msg.createdTimestamp)
                    //console.log(Math.floor(new Date().getTime()))
                });
            });
        }
    });
},60000)

client.on('messageReactionAdd',(context,user)=>{
    if (context.message.id==config.rules){
        console.log("got here")
        console.log(context.emoji)
        if(context.emoji.name==config.emoji){
            client.guilds.cache.get(context.message.guild.id).members.cache.get(user.id).roles.add(context.message.guild.roles.cache.get(config.member)).catch((err)=>{console.log(err)})
        }
    }
})
client.on('messageReactionRemove',(context,user)=>{
    if (context.message.id==config.rules){
        console.log("got here")
        console.log(context.emoji)
        if(context.emoji.name==config.emoji){
            client.guilds.cache.get(context.message.guild.id).members.cache.get(user.id).roles.remove(context.message.guild.roles.cache.get(config.member)).catch((err)=>{console.log(err)})
        }
    }
})

client.on('ready',()=>{
    
});


function arrayMatch(array1,array2){
    let found = false
    array1.forEach(element => {
        for (let j = 0; j<array2.length;j++){
            if (element.id.toString()==array2[j].toString()){
                found = true
            }
        }
    });
    return(found)
}

function findDiff(str1, str2){ 
    let diff= "";
    str2.split('').forEach(function(val, i){
      if (val != str1.charAt(i))
        diff += val ;         
    });
    return diff;
}

function saveJSON(){
    let fs = require('fs');
    fs.writeFile("config.json", JSON.stringify(config) , function(err) {
        if (err) {
            console.log(err);
        }
    });
}

client.login(config.token);