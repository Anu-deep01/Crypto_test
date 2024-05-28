import React, { useEffect, useState } from 'react';
import socketIOClient from "socket.io-client";
import axios from "axios";

const OrderBook = ({ pair, onOrderClick }) => {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/orderBook/${pair}`);
        setOrderBook(response.data);
      } catch (error) {
        console.error("Error fetching initial order book data:", error);
      }
    };

    fetchOrderBook();

    const socket = socketIOClient("http://localhost:4000");
    socket.emit('subscribe', pair);
    socket.on('orderBookData', data => {
      if (data) {
        setOrderBook(data);
      }
    });

    return () => socket.disconnect();
  }, [pair]);

  return (
    <div>
      <h2>Order Book for {pair}</h2>
      <div>
        <h3>Bids</h3>
        {orderBook.bids.length ? orderBook.bids.map((bid, index) => (
          <div key={index} onClick={() => onOrderClick(bid.price)}>{bid.price} - {bid.quantity}</div>
        )) : <div>No Bids</div>}
      </div>
      <div>
        <h3>Asks</h3>
        {orderBook.asks.length ? orderBook.asks.map((ask, index) => (
          <div key={index} onClick={() => onOrderClick(ask.price)}>{ask.price} - {ask.quantity}</div>
        )) : <div>No Asks</div>}
      </div>
    </div>
  );
};

export default OrderBook;
