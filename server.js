const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const amqp = require('amqplib/callback_api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let orderBook = {
  BTCUSDT: { bids: [], asks: [] },
  ETHBTC: { bids: [], asks: [] },
  LTCUSDT: { bids: [], asks: [] },
  XRPUSDT: { bids: [], asks: [] }
};

let orderHistory = [];
let userBalances = { USDT: 10000 }; // Initial balance for the user

const generateChartData = (pair) => {
  return {
    timestamps: Array.from({ length: 10 }, (_, i) => new Date(Date.now() - i * 60000).toLocaleTimeString()),
    prices: Array.from({ length: 10 }, () => (Math.random() * 10000).toFixed(2))
  };
};

const publishToQueue = (queue, message) => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
      console.error(error0);
      return;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        console.error(error1);
        return;
      }
      channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
      console.log(`Published to ${queue}:`, message);
    });

    setTimeout(() => {
      connection.close();
    }, 500);
  });
};

app.get('/api/orderBook/:pair', (req, res) => {
  const pair = req.params.pair;
  res.json(orderBook[pair]);
});

app.get('/api/orderHistory', (req, res) => {
  res.json(orderHistory);
});

app.post('/api/cancelOrder', (req, res) => {
  const { id } = req.body;
  const order = orderHistory.find(o => o.id === id);
  if (order && order.status === 'Pending') {
    order.status = 'Canceled';
    publishToQueue('cancelOrderQueue', { id });
    io.emit('orderHistory', orderHistory);
    res.status(200).send({ message: 'Order canceled successfully' });
  } else {
    res.status(400).send({ message: 'Order not found or already filled' });
  }
});

const checkOrders = () => {
  for (const pair in orderBook) {
    const bids = orderBook[pair].bids;
    const asks = orderBook[pair].asks;

    bids.forEach((bid, index) => {
      const matchingAsk = asks.find(ask => ask.price <= bid.price);
      if (matchingAsk) {
        // FIFO approach, process orders
        const bidOrder = orderHistory.find(order => order.price === bid.price && order.pair === pair && order.status === 'Pending');
        const askOrder = orderHistory.find(order => order.price === matchingAsk.price && order.pair === pair && order.status === 'Pending');
        
        if (bidOrder && askOrder) {
          bidOrder.status = 'Filled';
          askOrder.status = 'Filled';
          io.emit('orderHistory', orderHistory);
          io.to(pair).emit('notification', `Your ${bidOrder.type} order for ${bidOrder.pair} is completed`);
          io.to(pair).emit('notification', `Your ${askOrder.type} order for ${askOrder.pair} is completed`);
        }
      }
    });
  }
};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('subscribe', (pair) => {
    socket.join(pair);
    socket.emit('orderBookData', orderBook[pair]);
    socket.emit('chartData', generateChartData(pair));
  });

  socket.on('createOrder', (order) => {
    const currentPrice = parseFloat(orderBook[order.pair].bids[0]?.price || 0);
    
    if (order.type === 'MARKET_BUY' && userBalances.USDT >= order.quantity * currentPrice) {
      order.price = currentPrice;
      order.status = 'Filled';
      userBalances.USDT -= order.quantity * currentPrice;
    } else if (order.type === 'MARKET_SELL' && order.quantity <= userBalances[order.pair.split('/')[0]]) {
      order.price = currentPrice;
      order.status = 'Filled';
      userBalances.USDT += order.quantity * currentPrice;
      userBalances[order.pair.split('/')[0]] -= order.quantity;
    } else {
      order.status = 'Pending';
    }

    orderHistory.push(order);
    io.emit('orderHistory', orderHistory);
    publishToQueue('createOrderQueue', order);

    if (order.status === 'Filled') {
      io.to(order.pair).emit('notification', `Your ${order.type} order for ${order.pair} is completed`);
    }

    checkOrders();
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Listening on port 4000');
});
