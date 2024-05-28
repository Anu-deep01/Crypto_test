// src/App.js
import React, { useState } from "react";
import OrderBook from "./OrderBook";
import TradingChart from "./TradingChart";
import OrderForm from "./OrderForm";
import OrderHistory from "./OrderHistory";
import Notifications from "./Notifications";
import axios from "axios";

const App = () => {
  const [pair, setPair] = useState("BTCUSDT");
  const [userBalance, setUserBalance] = useState(10000); // Initial balance in USDT

  const handleOrderSubmit = (order) => {
    if (order.type.includes("BUY")) {
      setUserBalance(userBalance - order.total);
    }
  };

  const handleCancelOrder = async (order) => {
    try {
      await axios.post('http://localhost:4000/api/cancelOrder', { id: order.id });
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Crypto Trading Simulator</h1>
      <div
        style={{
          display: "flex",
          marginLeft: "70px",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        <input
          type="number"
          value={userBalance}
          onChange={(e) => setUserBalance(Number(e.target.value))}
          placeholder="Initial Balance (USDT)"
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        />
        <select
          onChange={(e) => setPair(e.target.value)}
          value={pair}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
          }}
        >
          <option value="BTCUSDT">BTC/USDT</option>
          <option value="ETHBTC">ETH/BTC</option>
          <option value="LTCUSDT">LTC/USDT</option>
          <option value="XRPUSDT">XRP/USDT</option>
        </select>
      </div>
      <div style={{margin:'30px'}}>
        <TradingChart pair={pair} />
        <OrderBook pair={pair} />
        <OrderForm
          pair={pair}
          userBalance={userBalance}
          onOrderSubmit={handleOrderSubmit}
        />
        <OrderHistory onCancelOrder={handleCancelOrder} />
        <Notifications />
      </div>
    </div>
  );
};

export default App;
