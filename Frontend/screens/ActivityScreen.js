import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { UserType } from "../UserContext";
import User from "../components/User";

const ActivityScreen = () => {
  const [selectedButton, setSelectedButton] = useState("people");
  const [users, setUsers] = useState([]);
  const { userId, setUserId } = useContext(UserType);

  const handleButtonClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.userId;
        setUserId(userId);

        const response = await axios.get(
          `https://37c993c6-7d90-4eb5-bf6d-42564beec53b-00-l4ltwecn8s44.kirk.replit.dev/user/${userId}`
        );
        setUsers(response.data);
      } catch (error) {
        console.log("Erro ao buscar usuários:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <ScrollView style={{ marginTop: 50 }}>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Atividade</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
          }}
        >
          {[
            { name: "followers", label: "Seguidores" },
            { name: "requests", label: "Solicitações" },
          ].map(({ name, label }) => (
            <TouchableOpacity
              key={name}
              onPress={() => handleButtonClick(name)}
              style={[
                styles.button,
                selectedButton === name ? { backgroundColor: "black" } : null,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedButton === name ? { color: "white" } : null,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          {selectedButton === "followers" && (
            <View style={{ marginTop: 20 }}>
              <Text>Você não tem seguidores...</Text>
              {users?.map((item, index) => (
                <User key={index} item={item} />
              ))}
            </View>
          )}
        </View>

         <View>
          {selectedButton === "requests" && (
            <View style={{ marginTop: 20 }}>
              <Text>Você não tem solicitações...</Text>
              {users?.map((item, index) => (
                <User key={index} item={item} />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderColor: "#D0D0D0",
    borderRadius: 6,
    borderWidth: 0.7,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "black",
  },
});
