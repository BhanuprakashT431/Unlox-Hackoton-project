import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./dashboard.css";

export default function Dashboard() {

  const [tasks, setTasks] = useState([]);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    loadTasks();

    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New Task",
        due_date: new Date().toISOString(),
        description: "",
        priority: "medium"
      })
    });

    showToast("Task Added 🚀");
    loadTasks();
  }

  function drawChart(data) {
    const ctx = document.getElementById("chart");
    if (!ctx) return;

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Tasks"],
        datasets: [{
          data: [data.length],
          backgroundColor: ["#6366f1"]
        }]
      }
    });
  }

  function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg;
    t.style.opacity = 1;
    setTimeout(() => t.style.opacity = 0, 2000);
  }

  function toggleTheme() {
    document.body.classList.toggle("dark");
    setDark(!dark);
  }

  return (
    <motion.div
      className="layout"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>CampusFlow</h2>
        <p>Dashboard</p>
        <p>Tasks</p>
        <p>Analytics</p>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <div className="topbar">
          <h1>Dashboard</h1>
          <div>
            <button onClick={addTask}>+ Add</button>
            <button onClick={toggleTheme}>🌙</button>
          </div>
        </div>

        {/* GRID */}
        <div className="grid">

          {/* TASKS */}
          <div className="card">
            <h3>Your Tasks</h3>

            <DragDropContext onDragEnd={(result) => {
              if (!result.destination) return;

              const items = Array.from(tasks);
              const [reordered] = items.splice(result.source.index, 1);
              items.splice(result.destination.index, 0, reordered);

              setTasks(items);
              showToast("Reordered 🔄");
            }}>

              <Droppable droppableId="tasks">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>

                    {tasks.map((t, index) => (
                      <Draggable key={t.id} draggableId={t.id.toString()} index={index}>
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task"
                            whileHover={{ scale: 1.03 }}
                          >
                            <h4>{t.title}</h4>
                            <p>{t.due_date}</p>
                            <span className={`badge ${t.priority}`}>
                              {t.priority}
                            </span>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                  </div>
                )}
              </Droppable>

            </DragDropContext>

          </div>

          {/* ANALYTICS */}
          <div className="card">
            <h3>Analytics</h3>
            <canvas id="chart"></canvas>
          </div>

          {/* CALENDAR */}
          <div className="card">
            <h3>📅 Calendar</h3>
            <input type="date" />
          </div>

        </div>

      
      </div>

      {/* TOAST */}
      <div id="toast"></div>

    </motion.div>
  );
}