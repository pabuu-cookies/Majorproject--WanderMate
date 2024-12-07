import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const ToDoListScreen = () => {
  const [task, setTask] = useState(""); // For new task input
  const [tasks, setTasks] = useState([]); // To store list of tasks

  // Function to add task
  const addTask = () => {
    if (task.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: Math.random().toString(), taskName: task, completed: false },
      ]);
      setTask(""); // Reset the input field
    }
  };

  // Function to delete task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // Function to toggle task completion
  const toggleCompletion = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={task}
        onChangeText={setTask}
      />
      <Button title="Add Task" onPress={addTask} color={"green"} />

      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity
              onPress={() => toggleCompletion(item.id)}
              style={[styles.task, item.completed && styles.completedTask]}
            >
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.completedText,
                ]}
              >
                {item.taskName}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteTask(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
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
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  task: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#ccc",
  },
  completedTask: {
    backgroundColor: "#d3f8d3",
  },
  taskText: {
    fontSize: 18,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: "red",
    borderRadius: 5,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ToDoListScreen;
