// src/OrderForm.js
import React, { useState } from "react";
import socketIOClient from "socket.io-client";

const OrderForm = ({ pair, userBalance, onOrderSubmit }) => {
  const [orderType, setOrderType] = useState("MARKET_BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = () => {
    if (
      !quantity ||
      (orderType !== "MARKET_BUY" && orderType !== "MARKET_SELL" && !price)
    )
      return;

    const socket = socketIOClient("http://localhost:4000");

    const order = {
      type: orderType,
      pair,
      price: orderType.includes("MARKET") ? null : parseFloat(price),
      quantity: parseFloat(quantity),
      total: orderType.includes("MARKET")
        ? null
        : parseFloat(price) * parseFloat(quantity),
      date: new Date(),
      status: orderType.includes('MARKET') ? 'Filled' : 'Pending',
    };
    socket.emit("createOrder", order);
    onOrderSubmit(order);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "16px", color: "#333" }}>Create Order</h2>
      <form style={{ display: "flex", gap: "30px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Order Type
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >
            <option value="MARKET_BUY">Market Buy</option>
            <option value="MARKET_SELL">Market Sell</option>
            <option value="BUY_LIMIT">Buy Limit</option>
            <option value="SELL_LIMIT">Sell Limit</option>
          </select>
        </div>
        {orderType !== "MARKET_BUY" && orderType !== "MARKET_SELL" && (
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                color: "#555",
              }}
            >
              Price
            </label>
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />
          </div>
        )}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Quantity
          </label>
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={userBalance < price * quantity}
          style={{
            margin: "18px",
            width: "165px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
            opacity: userBalance < price * quantity ? "0.6" : "1",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
