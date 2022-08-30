const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs =  require("fs")
 
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "wabot" }),
});
 
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client Ready")
})

client.on("message", async(message) => {
    // Program here for response client message
})

client.on('message_create', async(message) => {
    // Program here for respone your own message
    if(message.fromMe){
        if(message.hasMedia && message.type == 'document'){
            const attachmentData = await message.downloadMedia();
            fs.writeFile("./upload/document/" + attachmentData.filename,attachmentData.data,"base64",function (err) {
                if (err) {
                    console.log(err);
                }
            }
            );
            var fsReadStream = fs.createReadStream("./upload/document/" + attachmentData.filename, 'base64');
        }

        if(message.body.startsWith('!kickall')) {
            let chat = await message.getChat()
            if(chat.isGroup){
                try{
                    const members = chat.participants
                    for (let member of members) {
                        try{
                            if(member.id._serialized != member.owner._serialized){
                                chat.removeParticipants([member.id._serialized])
                            }
                        } catch(e) {
                            console.log(e)
                        }
                    }    
                } catch(e){
                    client.sendMessage(message.from,"Kamu bukan Admin")
                }
            } else {
                client.sendMessage(message.from,"Gunakan di grup")
            }
        }

        else if(message.body.startsWith('!creategroup')){
            let splt = message.body.split('.');
            let file = splt[1];
            let group = splt[2];
            fs.readFile("./upload/document/" + file, function(err,data) {
                let content = data.toString();
                let numbers = content.split(',');
                console.log(content);
                let members = []
                for (let x in numbers){
                    members.push(numbers[x].includes('@c.us') ? numbers[x] : `${numbers[x]}@c.us`)
                }
                console.log(members)
                client.createGroup(group,members)
            });

        } else if(message.body.startsWith('!joingroup')){
            let splt = message.body.split('.');
            let file = splt[1];
            let chat = await message.getChat()
            fs.readFile("./upload/document/" + file, function(err,data) {
                let content = data.toString();
                let numbers = content.split(',');
                console.log(content);
                let members = []
                for (let x in numbers){
                    members.push(numbers[x].includes('@c.us') ? numbers[x] : `${numbers[x]}@c.us`)
                }
                console.log(members)
                chat.addParticipants(members)
            });

        } else if (message.body.startsWith('!bc')) {
            let splt = message.body.split(' ')
            let file = splt[1];
            let messageIndex = message.body.indexOf(file) + file.length;
            let pesan = message.body.slice(messageIndex, message.body.length);
            fs.readFile("./upload/document/" + file, function(err,data) {
                content = data.toString();
                let numbers = content.split(',');
                console.log(numbers);
                for (let x in numbers){
                    number = numbers[x].includes('@c.us') ? numbers[x] : `${numbers[x]}@c.us`;
                    client.sendMessage(number, pesan); 
                }
            });

        } else if(message.body.startsWith('!allbc')) {
            let splt = message.body.split('.')
            let pesan = splt[1]
            client.getContacts().then((contacts) => {
                for(let contact of contacts){
                    client.sendMessage(contact.id._serialized,pesan)
                }
            });
        }
    }
})

client.initialize();