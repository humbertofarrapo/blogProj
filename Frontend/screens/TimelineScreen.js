import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  Button,
} from "react-native";
import React, { useState, useContext } from "react";
import { UserType } from "../UserContext";
import axios from "axios";

const TimelineScreen = () => {
  const { userId, setUserId } = useContext(UserType);
  const [content, setContent] = useState("");

  const handlePostSubmit = () => {
    const postData = {
      userId,
      content,
    };

    if (content) {
      axios
        .post("https://37c993c6-7d90-4eb5-bf6d-42564beec53b-00-l4ltwecn8s44.kirk.replit.dev/create-post", postData)
        .then((response) => {
          setContent(""); 
        })
        .catch((error) => {
          console.log("Erro ao criar post", error);
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{
            uri: "https://cdn-icons-png.flaticon.com/128/149/149071.png",
          }}
        />
        <Text style={styles.username}>Teste</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="black"
          multiline
          style={styles.textInput}
        />
      </View>

      <Button onPress={handlePostSubmit} title="Postar" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: "contain",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  textInput: {
    width: "100%",
    height: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    color: "black",
  },
});

export default TimelineScreen;
