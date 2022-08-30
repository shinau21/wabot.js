const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs =  require("fs")
 
const client = new Client({
  authStrategy: new LocalAuth(),
});
 
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Client Ready")
})

client.on("message", async(message) => {
})
client.on('message_create', async(message) => {
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
            let file = message.body.split(' ')[1];
            let group = message.body.split(' ')[2];
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
        }
    }
})
 
client.initialize();