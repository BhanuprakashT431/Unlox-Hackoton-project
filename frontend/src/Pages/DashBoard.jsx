import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./dashboard.css";

const API = "http://127.0.0.1:5000";

/* ===== STAT CARD ===== */
function StatCard({ title, value, color, icon }) {
  return (
    <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
      <div className="stat-top">
        <span>{icon}</span>
        <p>{title}</p>
      </div>
      <h2 style={{ color }}>{value}</h2>
    </motion.div>
  );
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 3000);
    return () => clearInterval(interval);
  }, []);

  async function loadAll() {
    try {
      // GET TASKS
      const res1 = await fetch(`${API}/tasks`);
      const data1 = await res1.json();
      setTasks(data1);
      drawChart(data1);

      // GET STATS
      const res2 = await fetch(`${API}/stats`);
      const data2 = await res2.json();
      setStats(data2);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  }

  /* 🔥 FIXED ADD TASK */
  async function addTask() {
    try {
      const title = prompt("Enter Task Name:");
      if (!title) return;

      const res = await fetch(`${API}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          due_date: new Date().toISOString(), // ✅ REQUIRED
          priority: "medium",
        }),
      });

      const data = await res.json();
      console.log("ADD RESPONSE:", data);

      loadAll(); // refresh UI
    } catch (err) {
      console.error("ADD ERROR:", err);
    }
  }

  function drawChart(data) {
    const ctx = document.getElementById("chart");
    if (!ctx) return;

    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Tasks"],
        datasets: [
          {
            data: [data.length],
            backgroundColor: ["#6366f1"],
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
      },
    });
  }

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🚀 CampusFlow</h2>
        <nav>
          <p className="active">Dashboard</p>
          <p>Tasks</p>
          <p>Analytics</p>
        </nav>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <div className="topbar">
          <h1>Welcome Back 👋</h1>
          <button className="primary" onClick={addTask}>
            + Add Task
          </button>
        </div>

        {/* STATS */}
        <div className="stats">
          <StatCard title="Total Tasks" value={stats.total} color="#6366f1" icon="📊" />
          <StatCard title="Completed" value={stats.completed} color="#22c55e" icon="✅" />
          <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon="⏳" />
        </div>

        {/* GRID */}
        <div className="grid">

          {/* TASKS */}
          <div className="card">
            <h3>Your Tasks</h3>

            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) return;
                const items = Array.from(tasks);
                const [reordered] = items.splice(result.source.index, 1);
                items.splice(result.destination.index, 0, reordered);
                setTasks(items);
              }}
            >
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
                            <div className="task-top">
                              <h4>{t.title}</h4>
                              <span className={`badge ${t.priority || "medium"}`}>
                                {t.priority || "medium"}
                              </span>
                            </div>

                            <p className="date">
                              {t.due_date
                                ? new Date(t.due_date).toLocaleDateString()
                                : "No date"}
                            </p>
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

        </div>

        {/* CALENDAR */}
        <div className="calendar-card">
          <h3>📅 Calendar</h3>
          <input type="date" className="date-input" />
        </div>

      </div>
    </div>
  );
}