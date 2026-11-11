import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = "https://task-manager-backend-p36r.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [active, setActive] = useState("dashboard");

  const loadTasks = async () => {
    try {
      const res = await axios.get(API);
      setTasks(res.data);
    } catch (err) {
      alert("Could not load tasks. Check whether the backend is running.");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await axios.post(API, {
        title: title.trim(),
        priority,
        dueDate: dueDate || null
      });
      setTitle("");
      setDueDate("");
      setPriority("Medium");
      loadTasks();
    } catch (err) {
      alert("Could not add task. Please try again.");
    }
  };

  const updateTask = async (id, field, value) => {
    try {
      await axios.patch(`${API}/${id}`, { [field]: value });
      loadTasks();
    } catch (err) {
      alert("Could not update task.");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      loadTasks();
    } catch (err) {
      alert("Could not delete task.");
    }
  };

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const isOverdue = (task) =>
    task.dueDate &&
    String(task.dueDate).slice(0, 10) < todayString &&
    task.status !== "Completed";

  const completed = tasks.filter(t => t.status === "Completed").length;
  const ongoing = tasks.filter(t => t.status === "Ongoing").length;
  const pending = tasks.filter(t => t.status === "Pending").length;
  const overdue = tasks.filter(isOverdue).length;
  const total = tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "All" ||
      (task.priority || "Medium") === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "tasks-section", label: "All Tasks", icon: "▤" },
    { id: "progress-section", label: "Progress Overview", icon: "▥" }
  ];

  const goToSection = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(15,23,42,0.04)"
  };

  const statusColor = {
    Pending: "#d97706",
    Ongoing: "#2563eb",
    Completed: "#059669"
  };

  const priorityColor = {
    Low: "#059669",
    Medium: "#d97706",
    High: "#dc2626"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", color: "#172033" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; }
        button, input, select { font: inherit; }
        .layout { display: flex; min-height: 100vh; }
        .sidebar {
          width: 245px; flex-shrink: 0; background: #172554; color: white;
          padding: 28px 16px; position: sticky; top: 0; height: 100vh;
        }
        .brand { font-size: 22px; font-weight: 700; margin: 0 10px 35px; }
        .nav-btn {
          display: block; width: 100%; text-align: left; padding: 13px 14px;
          margin: 7px 0; border: 0; border-radius: 9px;
          color: #dbeafe; background: transparent; cursor: pointer;
        }
        .nav-btn.active { background: #4338ca; color: white; }
        .main { flex: 1; min-width: 0; padding: 32px; }
        .section { scroll-margin-top: 24px; margin-bottom: 32px; }
        .stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; }
        .stat-number { font-size: 30px; font-weight: 700; margin-top: 10px; }
        .filters { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0; }
        .field {
          padding: 11px 12px; border: 1px solid #d1d5db;
          border-radius: 9px; background: white; min-width: 130px;
        }
        .task-list { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; }
        .task-title { overflow-wrap: anywhere; font-weight: 700; }
        .tag { display: inline-block; padding: 5px 9px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .task-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .small-btn { border: 1px solid #d1d5db; background: white; border-radius: 7px; padding: 7px 10px; cursor: pointer; }
        .primary-btn { border: 0; border-radius: 9px; background: #4338ca; color: white; padding: 11px 17px; cursor: pointer; }
        .chart-row { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 12px; margin: 17px 0; }
        .bar-bg { background: #e5e7eb; height: 13px; border-radius: 20px; overflow: hidden; }
        .bar { height: 100%; border-radius: 20px; transition: width .3s; }
        .alert { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 16px; margin: 18px 0; }
        @media(max-width:900px) {
          .sidebar { width: 190px; }
          .main { padding: 20px; }
          .stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .task-list { grid-template-columns: 1fr; }
        }
        @media(max-width:600px) {
          .layout { display: block; }
          .sidebar { position: static; width: 100%; height: auto; padding: 15px; }
          .brand { margin: 5px 8px 12px; }
          .main { padding: 16px; }
          .nav-btn { display: inline-block; width: auto; margin: 3px; padding: 9px; }
          .stats { grid-template-columns: 1fr 1fr; gap: 10px; }
          .chart-row { grid-template-columns: 78px 1fr 35px; gap: 8px; }
        }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="brand">TaskFlow</div>
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${active === item.id ? "active" : ""}`}
              onClick={() => goToSection(item.id)}
            >
              <span style={{ marginRight: 10 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        <main className="main">
          <section id="dashboard" className="section">
            <h2 style={{ fontWeight: 700 }}>Task Management Dashboard</h2>
            <p style={{ color: "#64748b" }}>Organize tasks, monitor progress, and meet your deadlines.</p>

            {overdue > 0 && (
              <div className="alert">
                <strong>⚠️ Overdue alert:</strong> You have {overdue} unfinished
                {overdue === 1 ? " task" : " tasks"} past the due date.
                <button
                  className="small-btn"
                  style={{ marginLeft: 12 }}
                  onClick={() => {
                    setStatusFilter("All");
                    setPriorityFilter("All");
                    setSearch("");
                    goToSection("tasks-section");
                  }}
                >
                  View tasks
                </button>
              </div>
            )}

            <div className="stats">
              {[
                ["Total Tasks", total, "#4338ca"],
                ["Pending", pending, "#d97706"],
                ["Ongoing", ongoing, "#2563eb"],
                ["Completed", completed, "#059669"]
              ].map(([label, value, color]) => (
                <div key={label} style={cardStyle}>
                  <div style={{ color: "#64748b" }}>{label}</div>
                  <div className="stat-number" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle, marginTop: 20 }}>
              <h5 style={{ fontWeight: 700 }}>Add New Task</h5>
              <form onSubmit={addTask}>
                <div className="filters">
                  <input
                    className="field"
                    style={{ flex: 2 }}
                    placeholder="Enter task title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                  <select
                    className="field"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                  <input
                    className="field"
                    type="date"
                    min={todayString}
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                  <button className="primary-btn" type="submit">+ Add Task</button>
                </div>
              </form>
            </div>
          </section>

          <section id="progress-section" className="section" style={cardStyle}>
            <h4 style={{ fontWeight: 700 }}>Progress Overview</h4>
            <p style={{ color: "#64748b" }}>Completed tasks: {progress}% of all tasks</p>
            {[
              ["Pending", pending, "#d97706"],
              ["Ongoing", ongoing, "#2563eb"],
              ["Completed", completed, "#059669"]
            ].map(([label, value, color]) => (
              <div className="chart-row" key={label}>
                <span>{label}</span>
                <div className="bar-bg">
                  <div
                    className="bar"
                    style={{ width: `${total ? (value / total) * 100 : 0}%`, background: color }}
                  />
                </div>
                <strong>{value}</strong>
              </div>
            ))}
            <div className="bar-bg" style={{ height: 18, marginTop: 22 }}>
              <div className="bar" style={{ width: `${progress}%`, background: "#4338ca" }} />
            </div>
            <small style={{ color: "#64748b" }}>Overall completion: {progress}%</small>
          </section>

          <section id="tasks-section" className="section" style={cardStyle}>
            <h4 style={{ fontWeight: 700 }}>All Tasks</h4>
            <div className="filters">
              <input
                className="field"
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className="field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
              <select className="field" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {filteredTasks.length === 0 ? (
              <p style={{ color: "#64748b", padding: 15 }}>No matching tasks found.</p>
            ) : (
              <div className="task-list">
                {filteredTasks.map(task => (
                  <div
                    key={task._id}
                    style={{
                      ...cardStyle,
                      borderLeft: `5px solid ${isOverdue(task) ? "#dc2626" : priorityColor[task.priority || "Medium"]}`
                    }}
                  >
                    <div className="task-title">{task.title}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                      <span className="tag" style={{ background: `${statusColor[task.status]}18`, color: statusColor[task.status] }}>
                        {task.status}
                      </span>
                      <span className="tag" style={{ background: `${priorityColor[task.priority || "Medium"]}18`, color: priorityColor[task.priority || "Medium"] }}>
                        {task.priority || "Medium"} Priority
                      </span>
                      {task.dueDate && (
                        <span className="tag" style={{
                          background: isOverdue(task) ? "#fee2e2" : "#f1f5f9",
                          color: isOverdue(task) ? "#b91c1c" : "#475569"
                        }}>
                          {isOverdue(task) ? "OVERDUE · " : "Due · "}
                          {String(task.dueDate).slice(0, 10)}
                        </span>
                      )}
                    </div>

                    <div className="task-actions">
                      <select
                        className="field"
                        style={{ padding: "7px", minWidth: 120 }}
                        value={task.status}
                        onChange={e => updateTask(task._id, "status", e.target.value)}
                        aria-label={`Status for ${task.title}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button className="small-btn" onClick={() => deleteTask(task._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13 }}>TaskFlow · Stay organized and productive</p>
        </main>
      </div>
    </div>
  );
}

export default App;