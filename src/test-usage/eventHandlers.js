export const onMessageChannelHandler = async (ws, socket, message) => {
    console.log(`Received message in onMessageChannelHandler from ${socket.id}: ${message}`);
    console.log('Connected sockets count:', await ws.connectedSocketsCount());
    const socketIds = await ws.connectedSocketIds();
    socketIds.forEach(async(sid) => {
        console.log('Connected socket ID:', sid, ' - state : ', await ws.connectedSocketState(sid));
    });
    ws.broadcastMessage('message', 'I am Server to message ' + socket.id, [socket.id])
};

export async function onAnnouncementChannelHandler(ws, socket, message) {
    console.log(`Received message in onAnnouncementChannelHandler from ${socket.id}: ${message}`);
    ws.broadcastMessage('announcement', 'I am Server to announce all')
};
