const amqp = require('amqplib/callback_api');
const io = require('socket.io-client');

const socket = io('http://localhost:4000');
let orderHistory = [];

const processOrder = (order) => {
  if (order.type.includes('MARKET')) {
    order.status = 'Filled';
    socket.emit('notification', `Your ${order.type} order for ${order.pair} is completed`);
  } else {
    order.status = 'Pending';
  }
  orderHistory.push(order);
  socket.emit('orderHistory', orderHistory);
};

const processCancelOrder = (id) => {
  const order = orderHistory.find(o => o.id === id);
  if (order && order.status === 'Pending') {
    order.status = 'Canceled';
    socket.emit('orderHistory', orderHistory);
  }
};

const consumeQueue = (queue, callback) => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(queue, { durable: true });
      console.log(`Waiting for messages in queue: ${queue}`);

      channel.consume(queue, (msg) => {
        if (msg !== null) {
          const message = JSON.parse(msg.content.toString());
          callback(message);
          channel.ack(msg);
        }
      }, { noAck: false });
    });
  });
};

consumeQueue('createOrderQueue', processOrder);
consumeQueue('cancelOrderQueue', processCancelOrder);
