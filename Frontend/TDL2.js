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

  const addTaskToUserList = (task) => {
    if (task) {
      setUserTasks((prevTasks) => [...prevTasks, task]);
    }
  };

  const deleteTaskFromUserList = async (taskId) => {
    await deleteTask(taskId);
    const taskToReAdd = userTasks.find((task) => task._id === taskId);
    setUserTasks((prevTasks) =>
      prevTasks.filter((task) => task._id !== taskId)
    );

    if (taskToReAdd) {
      setTasks((prevTasks) => [...prevTasks, taskToReAdd]);
    }
  };

  const deleteTask = async (taskId) => {
    if (authToken) {
      try {
        await api.delete(`${API_endpoint}/${taskId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
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
      <TextInput
        style={styles.input}
        placeholder="Choose location"
        value={location}
        onChangeText={setLocation}
      />
      <Button
        title="Recommend Task"
        onPress={fetchRecommendations}
        color={"green"}
      />
      <Text style={styles.title}>Recommended Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item, index) =>
          item._id ? item._id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <Text style={styles.taskText}>{item.task}</Text>
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

      <FlatList
        data={userTasks}
        keyExtractor={(item) => item._id.toString()}
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
      />

      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={newTask}
        onChangeText={setNewTask}
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
