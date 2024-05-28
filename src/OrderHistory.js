// src/OrderHistory.js
import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import "./OrderHistory.css";
import axios from "axios";

const OrderHistory = ({ onCancelOrder }) => {
  const [orders, setOrders] = useState([]);

  // Fetch initial order history
  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/orderHistory"
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
    // Set up socket connection for real-time updates
    const socket = socketIOClient("http://localhost:4000");
    socket.on("orderHistory", (data) => {
      if (data) {
        setOrders(data);
      }
    });

    return () => socket.disconnect();
  }, []);
  return (
    <div>
      <h2>Order History</h2>
      <table className="order-history">
        <thead>
          <tr>
            <th>Type</th>
            <th>Pair</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length ? (
            orders.map((order, index) => (
              <tr key={index}>
                <td>{order.type}</td>
                <td>{order.pair}</td>
                <td>{order.price}</td>
                <td>{order.quantity}</td>
                <td>{order.total}</td>
                <td>{order.status}</td>
                <td>
                  {order.status === "Pending" && (
                    <button onClick={() => onCancelOrder(order)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No Orders</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderHistory;
