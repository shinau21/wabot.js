const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
 
const client = new Client({
  authStrategy: new LocalAuth(),
});
 
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

const myGroupName = "MetroPay SMK";

client.on("ready", () => {
    console.log("Client Ready")
})

client.on('message_create', async(message) => {
    let chat = await message.getChat()
    console.log(chat)
    if(message.body == '!kickall') {
        let chat = await message.getChat()
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
    }
})
 
client.initialize();