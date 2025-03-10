import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const StarRating = ({ rating, onRate }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Text style={star <= rating ? styles.starFilled : styles.starEmpty}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: "row",
  },
  starFilled: {
    color: "gold",
    fontSize: 30,
    marginRight: 5,
  },
  starEmpty: {
    color: "#ccc",
    fontSize: 30,
    marginRight: 5,
  },
});

export default StarRating;
