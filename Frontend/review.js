import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import StarRating from "./starRating";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const MemoizedStarRating = React.memo(StarRating);

const ReviewItem = React.memo(({ item, onDelete }) => (
  <View style={styles.reviewItem}>
    <Text style={styles.reviewUser}>{item.user}</Text>
    <Text style={styles.reviewText}>{item.review}</Text>
    <Text style={styles.reviewRating}>Rating: {item.rating}/5</Text>
  </View>
));

const ReviewsComponent = () => {
  const [placeName, setPlaceName] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isPlaceSearched, setIsPlaceSearched] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const reviewInputRef = useRef(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token", error);
      }
    };

    fetchToken();
  }, []);

  const handleSearch = async () => {
    if (!placeName.trim()) {
      alert("Please enter a place name.");
      return;
    }

    setIsPlaceSearched(true);
    const response = await api.get(`/review/place/?place=${placeName}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const transformedReviews = response.data.map((review) => ({
      id: review._id,
      user: review.user.name,
      review: review.reviewText || "",
      rating: review.rating,
    }));

    setReviews(transformedReviews);
  };

  const handleSubmitReview = async () => {
    if (userRating === 0 || !userReview.trim()) {
      alert("Please provide a rating and write a review.");
      return;
    }

    const newReview = {
      place: placeName,
      reviewText: userReview,
      rating: userRating,
      visitDate: "2024-10-12",
      visitType: "solo",
    };

    const response = await api.post("/review/", newReview, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    const toSetYourReviews = {
      id: response.data._id,
      user: "You",
      review: response.data.reviewText || "",
      rating: response.data.rating,
    };

    setReviews((prev) => [toSetYourReviews, ...prev]);

    setUserReview("");
    setUserRating(0);
  };

  return (
    <FlatList
      data={[]} // Empty because we're using ListHeaderComponent and ListFooterComponent
      ListHeaderComponent={
        <View>
          <View style={styles.searchSection}>
            <TextInput
              style={styles.input}
              placeholder="Search for a place..."
              value={placeName}
              onChangeText={setPlaceName}
              autoCorrect={false}
            />
            <Button color={"green"} title="Search" onPress={handleSearch} />
          </View>

          {isPlaceSearched && (
            <View style={styles.reviewSection}>
              <Text style={styles.title}>Write your review:</Text>
              <MemoizedStarRating rating={userRating} onRate={setUserRating} />
              <TextInput
                ref={reviewInputRef}
                style={styles.reviewInput}
                placeholder="Write your review..."
                value={userReview}
                onChangeText={setUserReview}
                multiline
                autoCorrect={false}
              />
              <Button
                color={"green"}
                title="Submit Review"
                onPress={handleSubmitReview}
              />
            </View>
          )}
        </View>
      }
      // ListFooterComponent={
      //   <View>
      //     {isPlaceSearched && (
      //       <View style={styles.section}>
      //         <Text style={styles.sectionTitle}>Reviews for {placeName}</Text>
      //         <FlatList
      //           data={reviews}
      //           keyExtractor={(item) => item.id.toString()}
      //           renderItem={({ item }) => <ReviewItem item={item} />}
      //           ListEmptyComponent={
      //             <Text>No reviews yet. Be the first to review!</Text>
      //           }
      //           scrollEnabled={false}
      //         />
      //       </View>
      //     )}

      ListFooterComponent={
        <View>
          {isPlaceSearched && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews for {placeName}</Text>
              <FlatList
                data={reviews}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ReviewItem item={item} />}
                ListEmptyComponent={
                  <Text>No reviews yet. Be the first to review!</Text>
                }
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      }
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  searchSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  reviewSection: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    height: 100,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  reviewItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
    marginBottom: 5,
  },
  reviewRating: {
    fontSize: 12,
    color: "#888",
  },
});

export default ReviewsComponent;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   FlatList,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import api from "./api";
// import StarRating from "./starRating";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const ReviewsComponent = ({ authToken }) => {
//   const [placeName, setPlaceName] = useState("");
//   const [userRating, setUserRating] = useState(0);
//   const [userReview, setUserReview] = useState("");
//   const [reviews, setReviews] = useState([]);
//   const [yourReviews, setYourReviews] = useState([]);
//   const [isPlaceSearched, setIsPlaceSearched] = useState(false);
//   const [storedToken, setAuthToken] = useState(null);

//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem("authToken");
//         if (storedToken) {
//           setAuthToken(storedToken);
//         }
//       } catch (error) {
//         console.error("Error retrieving auth token:", error);
//       }
//     };
//     fetchToken();
//   }, []);

//   const dummyReviews = [
//     {
//       _id: "1",
//       user: { name: "John Doe" },
//       place: "Pashupatinath",
//       reviewText:
//         "Pashupatinath is a beautiful and peaceful place. The temple's atmosphere is tranquil and calming. A must-visit for those interested in spirituality and history. The surrounding areas are also serene and perfect for a quiet walk.",
//       rating: 5,
//       visitDate: "2025-02-16",
//       visitType: "solo",
//     },
//     {
//       _id: "2",
//       user: { name: "Jane Smith" },
//       place: "Pashupatinath",
//       reviewText:
//         "An amazing spiritual experience. The architecture is stunning, and the rituals conducted here are fascinating. Definitely worth the visit, though it can get crowded during peak times.",
//       rating: 4,
//       visitDate: "2025-01-10",
//       visitType: "group",
//     },
//   ];

//   const fetchReviews = async () => {
//     if (!placeName.trim()) {
//       alert("Please enter a place name.");
//       return;
//     }
//     try {
//       console.log("Fetching reviews for place:", placeName);

//       const apiUrl = `/review/place?place=${encodeURIComponent(placeName)}`;
//       console.log("Requesting:", apiUrl);

//       const response = await api.get(apiUrl, {
//         headers: { Authorization: `Bearer ${storedToken}` },
//       });
//       console.log(response);

//       setReviews(dummyReviews);
//       setIsPlaceSearched(true);
//     } catch (error) {
//       console.error("Error fetching reviews:", error);
//       alert("Failed to fetch reviews.");
//     }
//   };

//   const handleSubmitReview = async () => {
//     if (userRating === 0 || !userReview.trim()) {
//       alert("Please provide a rating and write a review.");
//       return;
//     }
//     try {
//       const newReview = {
//         place: placeName,
//         rating: userRating,
//         visitDate: new Date().toISOString().split("T")[0],
//         visitType: "solo",
//         reviewText: userReview,
//       };
//       console.log(storedToken);

//       const response = await api.post("/review/", newReview, {
//         headers: { Authorization: `Bearer ${storedToken}` },
//       });
//       console.log(storedToken);
//       setYourReviews((prev) => [response.data, ...prev]);
//       setReviews((prev) => [response.data, ...prev]);
//       setUserReview("");
//       setUserRating(0);
//     } catch (error) {
//       console.error("Error submitting review:", error);
//       alert("Failed to submit review.");
//     }
//   };

//   const handleDeleteReview = async (reviewId) => {
//     Alert.alert(
//       "Delete Review",
//       "Are you sure you want to delete this review?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await api.delete(`/review/${reviewId}`, {
//                 headers: { Authorization: `Bearer ${storedToken}` },
//               });
//               setYourReviews((prev) =>
//                 prev.filter((review) => review._id !== reviewId)
//               );
//               setReviews((prev) =>
//                 prev.filter((review) => review._id !== reviewId)
//               );
//             } catch (error) {
//               console.error("Error deleting review:", error);
//               alert("Failed to delete review.");
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <FlatList
//       data={[]}
//       ListHeaderComponent={
//         <View>
//           <View style={styles.searchSection}>
//             <TextInput
//               style={styles.input}
//               placeholder="Search for a place..."
//               value={placeName}
//               onChangeText={setPlaceName}
//               autoCorrect={false}
//             />
//             <Button color={"green"} title="Search" onPress={fetchReviews} />
//           </View>

//           {isPlaceSearched && (
//             <View style={styles.reviewSection}>
//               <Text style={styles.title}>Write your review:</Text>
//               <StarRating rating={userRating} onRate={setUserRating} />
//               <TextInput
//                 style={styles.reviewInput}
//                 placeholder="Write your review..."
//                 value={userReview}
//                 onChangeText={setUserReview}
//                 multiline
//                 autoCorrect={false}
//               />
//               <Button
//                 color={"green"}
//                 title="Submit Review"
//                 onPress={handleSubmitReview}
//               />
//             </View>
//           )}
//         </View>
//       }
//       ListFooterComponent={
//         <View>
//           {isPlaceSearched && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Reviews for {placeName}</Text>
//               <FlatList
//                 data={reviews}
//                 keyExtractor={(item) => item._id.toString()}
//                 renderItem={({ item }) => (
//                   <View style={styles.reviewItem}>
//                     <Text style={styles.reviewUser}>{item.user.name}</Text>
//                     <Text style={styles.reviewText}>{item.reviewText}</Text>
//                     <Text style={styles.reviewRating}>
//                       Rating: {item.rating}/5
//                     </Text>
//                   </View>
//                 )}
//                 ListEmptyComponent={
//                   <Text>No reviews yet. Be the first to review!</Text>
//                 }
//               />
//             </View>
//           )}

//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Your Reviews</Text>
//             <FlatList
//               data={yourReviews}
//               keyExtractor={(item) => item._id.toString()}
//               renderItem={({ item }) => (
//                 <View style={styles.reviewItem}>
//                   <Text style={styles.reviewUser}>You</Text>
//                   <Text style={styles.reviewText}>{item.reviewText}</Text>
//                   <Text style={styles.reviewRating}>
//                     Rating: {item.rating}/5
//                   </Text>
//                   <Button
//                     title="Delete"
//                     onPress={() => handleDeleteReview(item._id)}
//                     color="red"
//                   />
//                 </View>
//               )}
//               ListEmptyComponent={
//                 <Text>You haven't reviewed any places yet.</Text>
//               }
//             />
//           </View>
//         </View>
//       }
//       keyExtractor={(_, index) => index.toString()}
//       contentContainerStyle={styles.container}
//       keyboardShouldPersistTaps="handled"
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 20, backgroundColor: "#f5f5f5" },
//   searchSection: { marginBottom: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: "#fff",
//   },
//   reviewSection: {
//     marginBottom: 30,
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     elevation: 3,
//   },
//   title: { fontSize: 18, marginBottom: 10, fontWeight: "bold" },
//   section: {
//     marginBottom: 30,
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     elevation: 3,
//   },
//   sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
//   reviewItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
//   reviewUser: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
//   reviewText: { fontSize: 14, marginBottom: 5 },
//   reviewRating: { fontSize: 12, color: "#888" },
// });

// export default ReviewsComponent;
