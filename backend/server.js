
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/taskmanager")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB error:", err));

// Task Schema
const Task = mongoose.model(
  "Task",
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true
      },
      status: {
        type: String,
        enum: ["Pending", "Ongoing", "Completed"],
        default: "Pending"
      },
      priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
      },
      dueDate: {
        type: Date,
        default: null
      }
    },
    { timestamps: true }
  )
);

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch tasks" });
  }
});

// Add a task
app.post("/tasks", async (req, res) => {
  try {
    const { title, status, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    const task = await Task.create({
      title: title.trim(),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(dueDate && { dueDate })
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({
      message: "Could not add task",
      error: err.message
    });
  }
});

// Update task status, title, priority, or due date
app.patch("/tasks/:id", async (req, res) => {
  try {
    const allowedFields = ["title", "status", "priority", "dueDate"];
    const updates = {};

    allowedFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (
      Object.prototype.hasOwnProperty.call(updates, "title")
    ) {
      if (
        typeof updates.title !== "string" ||
        !updates.title.trim()
      ) {
        return res.status(400).json({
          message: "Task title cannot be empty"
        });
      }

      updates.title = updates.title.trim();
    }

    if (
      Object.prototype.hasOwnProperty.call(updates, "dueDate") &&
      updates.dueDate === ""
    ) {
      updates.dueDate = null;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(task);
  } catch (err) {
    res.status(400).json({
      message: "Could not update task",
      error: err.message
    });
  }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({
      message: "Could not delete task"
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
;
