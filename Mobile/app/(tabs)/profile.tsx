import { View, Text, Image, Switch, Platform } from "react-native";
import { useCallback, useEffect, useState } from "react";
import useTheme from "@/hooks/useTheme";
import { createProfileStyles } from "@/assets/styles/profile";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { getItemAsync } from "expo-secure-store";
import { useFocusEffect } from "expo-router";

const Profile = () => {
  const { isDark, setIsDark, colors } = useTheme();
  const styles = createProfileStyles(colors);

  const [userData, setUserData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      async function getUserDataFromLocalStorage() {
        const userData = { name: "", username: "" };

        if (Platform.OS !== "web") {
          userData.username = await getItemAsync("username");
          userData.name = await getItemAsync("name");
          setUserData(userData);
        } else {
          userData.username = localStorage.getItem("username");
          userData.name = localStorage.getItem("name");
          setUserData(userData);
        }
      }

      getUserDataFromLocalStorage();
    }, []),
  );

  if (!userData) {
    return (
      <SafeScreen style={styles.container}>
        <Text>Getting user details</Text>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <Text style={styles.sectionTitle}>Profile</Text>

      <View style={styles.profileCard}>
        <Image
          source={{
            uri: "https://randomuser.me/api/portraits/men/1.jpg",
          }}
          style={styles.avatar}
          resizeMode="cover"
        />

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.username}>@{userData.username}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.label}>Dark Mode</Text>
          </View>

          <Switch
            value={isDark}
            onValueChange={setIsDark}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor={colors.surface}
            ios_backgroundColor={colors.border}
          />
        </View>

        <Text style={styles.helperText}>
          {isDark ? "Dark mode is enabled" : "Light mode is enabled"}
        </Text>
      </View>
    </SafeScreen>
  );
};

export default Profile;
