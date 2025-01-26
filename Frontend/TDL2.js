import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import api from "./api";

const ToDoListScreen2 = () => {
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [newTask, setNewTask] = useState(""); // For new task input
  const [authToken, setAuthToken] = useState(null); // Store the auth token
  const [location, setLocation] = useState(""); // Holds the location input

  // API URL
  const API_endpoint = "/todo"; // Replace with actual API base URL

  useEffect(() => {
    const fetchTokenAndTasks = async () => {
      try {
        // Get the auth token from AsyncStorage
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setAuthToken(token);
          // Fetch user's tasks if token exists
          fetchUserTasks(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token", error);
      }
    };

    fetchTokenAndTasks(); // Call the function on component mount
  }, []);

  const fetchUserTasks = async (token) => {
    try {
      const response = await api.get(`${API_endpoint}/user/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data, "todos");
      setUserTasks(response.data);
    } catch (error) {
      console.error("Error fetching user tasks", error);
    }
  };

  const addTask = async () => {
    if (newTask.trim() && authToken) {
      try {
        const response = await api.post(
          `${API_endpoint}`,
          { task: newTask },
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Use the auth token here
            },
          }
        );
        setUserTasks([...userTasks, response.data]);
        setNewTask(""); // Reset input field
      } catch (error) {
        console.error("Error adding task", error);
      }
    }
  };

  // Function to add a task to the user's list
  const addTaskToUserList = (task) => {
    if (task) {
      setUserTasks((prevTasks) => [...prevTasks, task]); // Add the task to the user's list
    }
  };

  // Function to delete a task from the user's personal list
  const deleteTaskFromUserList = async (taskId) => {
    await deleteTask(taskId);
    const taskToReAdd = userTasks.find((task) => task._id === taskId);
    setUserTasks((prevTasks) =>
      prevTasks.filter((task) => task._id !== taskId)
    );
    // Re-add the deleted task back to the recommended list
    if (taskToReAdd) {
      setTasks((prevTasks) => [...prevTasks, taskToReAdd]);
    }
  };

  const deleteTask = async (taskId) => {
    if (authToken) {
      try {
        await api.delete(`${API_endpoint}/${taskId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Use the auth token here
          },
        });
        setUserTasks(userTasks.filter((task) => task._id !== taskId));
      } catch (error) {
        console.error("Error deleting task", error);
      }
    }
  };

  const fetchRecommendations = async () => {
    if (location.trim()) {
      try {
        const response = await api.post(
          `/chatbot/suggestions/${location}`,
          {},
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        console.log(response.data);
        if (response.data.tasks) {
          setTasks(response.data.tasks);
        } else {
          setTasks([response.data.message]);
        }
      } catch (error) {
        console.error("Error fetching recommendations", error);
      }
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await api.patch(`/status/${taskId}`, {
        status: status,
      });

      console.log("Task status updated successfully:", response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: updatedTask.status } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Choose location"
        value={location}
        onChangeText={setLocation} // Update location state as user types
      />
      <Button
        title="Recommend Task"
        onPress={fetchRecommendations}
        color={"green"}
      />
      <Text style={styles.title}>Recommended Tasks</Text>

      {/* Display the available tasks */}
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>{item}</Text>
            <TouchableOpacity
              onPress={() => addTaskToUserList(item)}
              style={styles.addButton}
            >
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.title}>Your To-Do List</Text>

      {/* Display the user's added tasks */}
      <FlatList
        data={userTasks}
        renderItem={({ item }) => (
          <View style={styles.userTaskContainer}>
            <Text style={styles.taskText}>{item.task}</Text>
            <TouchableOpacity
              onPress={() => deleteTaskFromUserList(item._id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item._id.toString()}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={newTask} // Use newTask here
        onChangeText={setNewTask} // Update newTask
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
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ToDoListScreen2;
