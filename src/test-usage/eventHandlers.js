export function onMessageChannelHandler(socket, message){
    console.log(`Received message in onMessageChannelHandler from ${socket.id}: ${message}`);
    this.broadcastMessage('announcement', 'I am Server')
};

export async function onAnnouncementChannelHandler(socket, message) {
    console.log(`Received message in onAnnouncementChannelHandler from ${socket.id}: ${message}`);
    // this.broadcastMessage('message', 'I am Server')
};
