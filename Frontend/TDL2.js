import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
  toString,
} from "react-native";

const ToDoListScreen2 = () => {
  // Initialize the recommended tasks with dummy data
  const [tasks, setTasks] = useState([
    { id: 1, name: "Lakhe dance" },
    { id: 2, name: "Indra jatra" },
    { id: 3, name: "Bisket jatra" },
    { id: 4, name: "Kathmandu durbar square" },
    { id: 5, name: "Local newari cuisine" },
  ]);

  const [userTasks, setUserTasks] = useState([]); // Tasks added to the user's to-do list

  // Function to add a task to the user's personal list
  const addTaskToUserList = (task) => {
    if (!userTasks.find((t) => t.id === task.id)) {
      // Avoid adding duplicates
      setUserTasks((prevTasks) => [...prevTasks, task]);
      // Remove the task from the recommended tasks list
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
    }
  };
  // Function to add task
  const addTask = () => {
    if (tasks.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: Math.random().toString(), taskName: tasks, completed: false },
      ]);
      setTasks(""); // Reset the input field
    }
  };

  // Function to delete a task from the user's personal list
  const deleteTaskFromUserList = (taskId) => {
    const taskToReAdd = userTasks.find((task) => task.id === taskId);
    setUserTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    // Re-add the deleted task back to the recommended list
    if (taskToReAdd) {
      setTasks((prevTasks) => [...prevTasks, taskToReAdd]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Choose location"
        value={tasks}
        onChangeText={setTasks}
      />
      <Button
        title="Recommend Task"
        onPress={console.log("recommend gara sathi")}
        color={"green"}
      />
      <Text style={styles.title}>Recommended Tasks</Text>

      {/* Display the available tasks */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => addTaskToUserList(item)}
              style={styles.addButton}
            >
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <Text style={styles.title}>Your To-Do List</Text>

      {/* Display the user's added tasks */}

      <FlatList
        data={userTasks}
        renderItem={({ item }) => (
          <View style={styles.userTaskContainer}>
            <Text style={styles.taskText}>{item.name}</Text>
            <TouchableOpacity
              onPress={() => deleteTaskFromUserList(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={tasks}
        onChangeText={setTasks}
      />
      <Button title="Add Task" onPress={addTask} color={"green"} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  userTaskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#e0ffe0",
    borderRadius: 5,
  },
  taskText: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ToDoListScreen2;
