import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import "./Dashboard.css";

const API = "http://127.0.0.1:5000";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "medium",
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();

      const safeTasks = Array.isArray(data) ? data : [];
      setTasks(safeTasks);

      const completed = safeTasks.filter(t => t.status === "completed").length;
      const pending = safeTasks.length - completed;

      setStats({
        total: safeTasks.length,
        completed,
        pending,
      });

      drawChart(completed, pending);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  }

  function drawChart(completed, pending) {
    const ctx = document.getElementById("chart");
    if (!ctx) return;

    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Completed", "Pending"],
        datasets: [
          {
            data: [completed, pending],
            backgroundColor: ["#22c55e", "#f59e0b"],
          },
        ],
      },
    });
  }

  async function submitTask() {
    await fetch(`${API}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        due_date: new Date(form.due_date).toISOString(),
      }),
    });

    setShowModal(false);
    loadAll();
  }

  async function markComplete(id) {
    await fetch(`${API}/complete/${id}`, { method: "PUT" });
    loadAll();
  }

  async function deleteTask(id) {
    await fetch(`${API}/delete/${id}`, { method: "DELETE" });
    loadAll();
  }

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🚀 CampusFlow</h2>
        <p className="active">Dashboard</p>
        <p>Tasks</p>
        <p>Analytics</p>
      </div>

      {/* MAIN */}
      <div className="main">

        <div className="topbar">
          <h1>Welcome Back 👋</h1>
          <button onClick={() => setShowModal(true)}>+ Add Task</button>
        </div>

        {/* STATS */}
        <div className="stats">
          <div className="stat-card">
            <p>Total</p>
            <h2>{stats.total}</h2>
          </div>
          <div className="stat-card">
            <p>Completed</p>
            <h2 style={{ color: "#22c55e" }}>{stats.completed}</h2>
          </div>
          <div className="stat-card">
            <p>Pending</p>
            <h2 style={{ color: "#f59e0b" }}>{stats.pending}</h2>
          </div>
        </div>

        {/* GRID */}
        <div className="grid">

          {/* TASKS */}
          <div className="card">
            <h3>Your Tasks</h3>

            {tasks.map((t) => (
              <div key={t.id} className={`task ${t.status}`}>

                <div className="task-header">
                  <h4>{t.title}</h4>
                  <span className={`badge ${t.priority}`}>
                    {t.priority}
                  </span>
                </div>

                <p className="date">
                  {t.due_date
                    ? new Date(t.due_date).toDateString()
                    : "No Date"}
                </p>

                <div className="task-actions">

                  {t.status !== "completed" ? (
                    <button onClick={() => markComplete(t.id)}>
                      ✅ Complete
                    </button>
                  ) : (
                    <span className="done">✔ Completed</span>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(t.id)}
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>
            ))}
          </div>

          {/* ANALYTICS */}
          <div className="card">
            <h3>Analytics</h3>
            <canvas id="chart"></canvas>
          </div>

        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <h2>Add Task</h2>

            <input
              placeholder="Title"
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="date"
              onChange={(e) =>
                setForm({ ...form, due_date: e.target.value })
              }
            />

            <select
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>

            <div className="modal-buttons">
              <button onClick={submitTask}>Add</button>
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}