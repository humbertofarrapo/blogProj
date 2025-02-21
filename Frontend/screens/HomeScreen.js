import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
import React, { useEffect, useContext, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import { UserType } from "../UserContext";
import axios from "axios";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const HomeScreen = () => {
  const { userId, setUserId } = useContext(UserType);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        const decodedToken = jwt_decode(token);
        setUserId(decodedToken.userId);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const fetchPosts = async () => {
    try {
      const response = await axios.get("https://37c993c6-7d90-4eb5-bf6d-42564beec53b-00-l4ltwecn8s44.kirk.replit.dev/get-posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Erro ao buscar publicações:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `https://37c993c6-7d90-4eb5-bf6d-42564beec53b-00-l4ltwecn8s44.kirk.replit.dev/posts/${postId}/${userId}/like`
      );
      const updatedPost = response.data;
      setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
    } catch (error) {
      console.error("Erro ao curtir a publicação:", error);
    }
  };

  const handleDislike = async (postId) => {
    try {
      const response = await axios.put(
        `https://37c993c6-7d90-4eb5-bf6d-42564beec53b-00-l4ltwecn8s44.kirk.replit.dev/posts/${postId}/${userId}/unlike`
      );
      const updatedPost = response.data;
      setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
    } catch (error) {
      console.error("Erro ao remover curtida da publicação:", error);
    }
  };

  return (
    <ScrollView style={{ marginTop: 50, flex: 1, backgroundColor: "white" }}>
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Image
          style={{ width: 60, height: 40, resizeMode: "contain" }}
          source={{ uri: "https://freelogopng.com/images/all_img/1688663386threads-logo-transparent.png" }}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        {posts?.map((post) => (
          <View
            key={post._id}
            style={{
              padding: 15,
              borderColor: "#D0D0D0",
              borderTopWidth: 1,
              flexDirection: "row",
              gap: 10,
              marginVertical: 10,
            }}
          >
            <View>
              <Image
                style={{ width: 40, height: 40, borderRadius: 20, resizeMode: "contain" }}
                source={{ uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png" }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 15, fontWeight: "bold", marginBottom: 4 }}>{post?.user?.name}</Text>
              <Text>{post?.content}</Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 15 }}>
                {post?.likes?.includes(userId) ? (
                  <AntDesign onPress={() => handleDislike(post?._id)} name="heart" size={18} color="red" />
                ) : (
                  <AntDesign onPress={() => handleLike(post?._id)} name="hearto" size={18} color="black" />
                )}

                <FontAwesome name="comment-o" size={18} color="black" />
                <Ionicons name="share-social-outline" size={18} color="black" />
              </View>

              <Text style={{ marginTop: 7, color: "gray" }}>
                {post?.likes?.length} curtidas • {post?.replies?.length} respostas
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
