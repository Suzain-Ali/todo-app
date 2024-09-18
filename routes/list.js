const router = require("express").Router();
const User = require("../models/user");
const List = require("../models/list");

//create
router.post("/addTask", async (req, res) => {
  try {
    const { title, body, id } = req.body;

    // Validate input
    if (!title || !body || !id) {
      return res.status(400).json({ message: "Title, body, and user ID are required" });
    }

    // Find the user by ID
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create and save the new task
    const list = new List({ title, body, user: existingUser._id });
    await list.save();

    // Add the task to the user's list
    existingUser.list.push(list._id);
    await existingUser.save();

    return res.status(201).json({ list });
  } catch (error) {
    console.error("Error adding task:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


//update
router.put("/updateTask/:id", async (req, res) => {
  try {
    const { title, body } = req.body;

    // Update the task and return the updated document
    const updatedTask = await List.findByIdAndUpdate(
      req.params.id,
      { title, body },
      { new: true } // Ensures the updated document is returned
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task Updated", updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


//delete

router.delete("/deleteTask/:id", async (req, res) => {
  try {
    const { id } = req.body; // User's ID (sent in the request body)
    const taskId = req.params.id; // Task ID (sent in the URL params)

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid User ID or Task ID" });
    }

    // Find and update user
    const existingUser = await User.findByIdAndUpdate(
      id,
      { $pull: { list: taskId } }, // Pull task ID from user's list
      { new: true }
    );

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find and delete the task
    const deletedTask = await List.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Respond with success
    res.status(200).json({ message: "Task Deleted" });

  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



//getTska
router.get("/getTasks/:id", async (req, res) => {
  try {
    const list = await List.find({ user: req.params.id }).sort({
      createdAt: -1,
    });
    if (list.length !== 0) {
      res.status(200).json({ list: list });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
