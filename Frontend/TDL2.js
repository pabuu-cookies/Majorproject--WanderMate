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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import api from "./api";

const ToDoListScreen2 = () => {
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const [location, setLocation] = useState("");

  const API_endpoint = "/todo";

  useEffect(() => {
    const fetchTokenAndTasks = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setAuthToken(token);
          fetchUserTasks(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token", error);
      }
    };

    fetchTokenAndTasks();
  }, []);

  const fetchUserTasks = async (token) => {
    try {
      const response = await api.get(`${API_endpoint}/user/`, {
        headers: { Authorization: `Bearer ${token}` },
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
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setUserTasks([...userTasks, response.data]);
        setNewTask("");
      } catch (error) {
        console.error("Error adding task", error);
      }
    }
  };
  const addTaskToUserList = async (task) => {
    if (task) {
      setUserTasks((prevTasks) => [
        ...prevTasks,
        { _id: task._id || Date.now(), task: task.task || task },
      ]);

      // Remove task from recommended list
      setTasks((prevTasks) => prevTasks.filter((t) => t !== task));

      if (authToken) {
        try {
          const response = await api.post(
            `${API_endpoint}`,
            { task: task },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          setUserTasks([...userTasks, response.data]);
          setNewTask("");
        } catch (error) {
          console.error("Error adding task", error);
        }
      }
    }
  };

  const deleteTaskFromUserList = async (taskId) => {
    try {
      if (!taskId) {
        console.error("Task ID is undefined or invalid. Cannot delete.");
        return;
      }

      console.log("Deleting task with ID:", taskId);

      const response = await deleteTask(taskId);

      console.log("Delete response:", response);

      setUserTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      console.error(
        "Error deleting task:",
        error?.response?.data || error?.message || error
      );
    }
  };

  const deleteTask = async (taskId) => {
    try {
      console.log(`Attempting to delete task with ID: ${taskId}`);
      console.log(API_endpoint);
      const response = await api.delete(`${API_endpoint}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`, // Send the token in the header
        },
      });
      // const response = await axios.delete(
      //   `http://192.168.1.65:5500/todo/${taskId}`, // Replace with your actual URL
      //   { message },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${authToken}`, // Send the token in the header
      //       "Content-Type": "text/plain",
      //     },
      //     responseType: "text",
      //   }
      // );

      console.log("Delete API response:", response?.data);
      return response?.data;
    } catch (error) {
      console.error("API Delete Error:", error.message);
    }
  };

  const fetchRecommendations = async () => {
    if (location.trim()) {
      try {
        const response = await api.post(
          `/chatbot/suggestions/${location}`,
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log(response.data);

        if (Array.isArray(response.data.tasks)) {
          setTasks(response.data.tasks);
        } else {
          setTasks([{ task: response.data.message }]);
        }
      } catch (error) {
        console.error("Error fetching recommendations", error);
      }
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await api.patch(`/status/${taskId}`, { status });

      console.log("Task status updated successfully:", response.data);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: response.data.status } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Input Field for Location */}
      <TextInput
        style={styles.input}
        placeholder="Choose location"
        value={location}
        onChangeText={setLocation}
      />

      {/* Fetch Task Recommendations */}
      <Button
        title="Recommend Task"
        onPress={fetchRecommendations}
        color="green"
      />

      <Text style={styles.title}>Recommended Tasks</Text>

      {/* List of Recommended Tasks */}
      <FlatList
        data={tasks ?? []} // Ensure tasks is always an array
        keyExtractor={(item, index) =>
          item?._id ? item._id.toString() : `task-${index}`
        }
        renderItem={({ item }) =>
          item ? (
            <View style={styles.taskContainer}>
              <Text style={styles.taskText}>{item?.task || item}</Text>
              <TouchableOpacity
                onPress={() => addTaskToUserList(item)}
                style={styles.addButton}
              >
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <Text style={styles.title}>Your To-Do List</Text>

      {/* User's Task List */}
      <FlatList
        data={userTasks ?? []} // Ensure userTasks is always an array
        keyExtractor={(item) =>
          item?._id?.toString() || `user-task-${Math.random()}`
        }
        renderItem={({ item }) =>
          item ? (
            <View style={styles.userTaskContainer}>
              <Text style={styles.taskText}>
                {item?.task || "Untitled Task"}
              </Text>
              <TouchableOpacity
                onPress={() => deleteTaskFromUserList(item._id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Complete</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Add New Task */}
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={newTask}
        onChangeText={setNewTask}
      />
      <Button title="Add Task" onPress={addTask} color="green" />
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    flexWrap: "wrap",
  },
  taskText: {
    fontSize: 16,
    color: "black",
    flex: 1,
    marginRight: 10,
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
