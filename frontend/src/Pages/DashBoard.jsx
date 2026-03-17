import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

export default function Dashboard() {

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const res = await fetch("http://127.0.0.1:5000/tasks");
    const data = await res.json();
    setTasks(data);
    drawChart(data);
  }

  async function addTask() {
    await fetch("http://127.0.0.1:5000/add", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        title:"New Task",
        due_date:"2026",
        description:"",
        priority:"medium"
      })
    });

    loadTasks();
  }

  function drawChart(data){
    new Chart(document.getElementById("chart"), {
      type: "doughnut",
      data: {
        labels: ["Tasks"],
        datasets: [{
          data: [data.length],
          backgroundColor: ["#4CAF50"]
        }]
      }
    });
  }

  return (
    <div style={{ display: "flex" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#111", color: "white", padding: 20 }}>
        <h2>CampusFlow</h2>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 20 }}>

        <h1>Dashboard</h1>

        <button onClick={addTask}>Add Task</button>

        <canvas id="chart" style={{ maxWidth: 300 }}></canvas>

        {tasks.map(task => (
          <div key={task.id} style={{ margin: 10, padding: 10, border: "1px solid #ccc" }}>
            {task.title}
          </div>
        ))}

      </div>

    </div>
  );
}