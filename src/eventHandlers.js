export function onMessageHandler(socket, message){
    console.log(`Received message from ${socket.id}: ${message}`);
};

export async function onCustomEventHandler(socket, message) {
    console.log(`Custom event received from ${socket.id}:`, message);
    console.log(`message `, message);
    this.broadcastMessage(message)
    await this.DB().insert('users', {name: 'wai', email: 'wai@gmail.com', message: 'testing message'});
};
