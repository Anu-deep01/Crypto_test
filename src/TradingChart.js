import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import socketIOClient from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TradingChart = ({ pair }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: `${pair} Price`,
        data: [],
        borderColor: "rgba(75,192,192,1)",
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const socket = socketIOClient("http://localhost:4000");

    socket.emit("subscribe", pair);
    socket.on("chartData", (data) => {
      if (data) {
        setChartData({
          labels: data.timestamps,
          datasets: [
            {
              label: `${pair} Price`,
              data: data.prices,
              borderColor: "rgba(75,192,192,1)",
              fill: false,
            },
          ],
        });
      }
    });

    return () => socket.disconnect();
  }, [pair]);

  return (
    <div style={{ width: '1064px', height: '500px' }}>
      <Line data={chartData} />
    </div>
  );
};

export default TradingChart;
