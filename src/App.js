import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse";
// import {
//   LineChart,
//   ResponsiveContainer,
//   Legend,
//   Tooltip,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
// } from "recharts";
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
import { Line } from "react-chartjs-2";
// import CanvasJSReact from "./canvasjs.react";
// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  // UseStates
  const [indexes, setIndexes] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);

  // Values declared
  const allowedExtensions = ["csv"];

  // Functions
  const handleFileChange = (e) => {
    setError("");
    if (e.target.files.length > 0) {
      const inputFile = e.target.files[0];
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }
      setFile(inputFile);
    }
  };

  const handleParse = () => {
    if (!file) return setError("Enter a valid file");
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      setData(parsedData);
    };
    reader.readAsText(file);
  };

  const ans = [];

  const deduceData = () => {
    for (var i = 0; i < 1000; i++) {
      ans.push({
        x: JSON.parse(data[indexes[currentQuestion]]?.x)[i + 1],
        y: JSON.parse(data[indexes[currentQuestion]]?.y)[i + 1],
      });
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
      },
    },
  };

  console.log(data);

  const labels = data.length
    ? JSON.parse(data[indexes[currentQuestion]]?.x)
    : [];

  console.log(data.length > 0 && JSON.parse(data[indexes[currentQuestion]]?.y));

  const dataSet = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: labels.map(() =>
          data.length > 0 ? JSON.parse(data[indexes[currentQuestion]]?.y) : 500
        ),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < 20) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  // Api Calls
  function getIndexes() {
    axios.get("http://127.0.0.1:5000/").then((response) => {
      setIndexes(response.data.index);
    });
  }

  // UseEffects
  useEffect(() => {
    getIndexes();
  }, []);

  useEffect(() => {
    handleParse();
  }, [file]);

  useEffect(() => {
    data.length > 0 && deduceData();
  }, [data]);

  // Driver Code
  return (
    <div className="app-section">
      <div className="input-section">
        <label htmlFor="csvInput" style={{ display: "block" }}>
          Enter CSV File
        </label>
        <input
          onChange={handleFileChange}
          id="csvInput"
          name="file"
          type="File"
        />
      </div>
      {file ? (
        <>
          <div className="question-section">
            <div className="question-count">
              <span>Question {currentQuestion + 1}</span>/20
            </div>
            <div className="question-text">
              Do this graph belong to the selected chip?
            </div>
          </div>
          <Line options={options} data={dataSet} />;
          <div className="answer-section">
            {["Yes", "No"].map((answerOption, index) => (
              <button
                onClick={() => handleAnswerOptionClick(answerOption.isCorrect)}
                key={index}
              >
                {answerOption}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
