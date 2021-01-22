const synaptic = require('synaptic');
const express = require('express');
const app = express()
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app)
const sockets = socketio(server)
const port = 3000;

app.use(express.static('./public'))

sockets.on('connection', (socket) => {

    const Id = socket.id
    console.log(`Client connected ${Id}`);

    socket.on('disconnect', () => {
        const Id = socket.id
        console.log(`Client desconnected ${Id}`);
    });

    socket.on('cmd', (cmd) => {
        console.log("Client:", cmd);
        socket.emit('setup', TestRNA(cmd));
    });
});

server.listen(port, () => {
    console.log('Listen server on', port);
});

// function TestRNA(inputs){
//     const layers = {
//         inputs: 2,
//         hiddens: 3,
//         outputs: 1
//     };
    
//     var rateLearn = 0.03;
//     var errorMax = 0.001;
//     var epochMax = 0;
//     var jump = 1;
//     var shuffle = false;
//     var chart = false;
//     var dataset = [];

//     const network = nn.createNetwork(layers);
    
//     //let res = network.Trainner(dataset, rateLearn, errorMax, epochMax, shuffle, jump, chart);

//     return network.getWeights();
// }