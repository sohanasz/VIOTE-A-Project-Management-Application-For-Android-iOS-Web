import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";

import SafeScreen from "@/components/SafeScreen";
import useTheme from "@/hooks/useTheme";
import { register } from "../lib/auth";

export default function SignUpScreen({ setSignInScreen }: any) {
  const { colors } = useTheme();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !username || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await register(
        fullName,
        username.toLowerCase(),
        email,
        password,
      );

      if (res.statusCode === 201) {
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Signup error", "Some error occurred, try again!");
      }
    } catch (err: any) {
      Alert.alert(
        "Signup failed",
        err?.response?.data?.message ?? "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  const styles = createStyles(colors);

  return (
    <SafeScreen style={{ flex: 1 }}>
      <View style={styles.background}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
        >
          <Animatable.View
            animation="fadeIn"
            duration={500}
            delay={100}
            useNativeDriver
            style={styles.brand}
          >
            <Text style={styles.brandText}>VIXI</Text>
            <View style={styles.brandUnderline} />
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={600}
            easing="ease-out-cubic"
            useNativeDriver
            style={styles.card}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Start managing your projects efficiently
              </Text>
            </View>

            <Input
              icon="person-outline"
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              colors={colors}
            />

            <Input
              icon="at-outline"
              placeholder="Username"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              colors={colors}
            />

            <Input
              icon="mail-outline"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              colors={colors}
            />

            <Input
              icon="lock-closed-outline"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              colors={colors}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={loading}
              style={[styles.button, loading && { opacity: 0.7 }]}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creating account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setSignInScreen(true)}
            >
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </KeyboardAwareScrollView>
      </View>
    </SafeScreen>
  );
}

function Input({ icon, colors, ...props }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.backgrounds.input,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 12,
        marginBottom: 14,
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={colors.textMuted}
        style={{ marginRight: 10 }}
      />
      <TextInput
        {...props}
        style={{
          flex: 1,
          paddingVertical: 12,
          fontSize: 15,
          color: colors.text,
        }}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 20,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      color: colors.textMuted,
    },
    button: {
      marginTop: 10,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    buttonText: {
      color: colors.invertedText,
      fontSize: 16,
      fontWeight: "600",
    },
    footerText: {
      marginTop: 18,
      textAlign: "center",
      fontSize: 14,
      color: colors.textMuted,
    },
    link: {
      color: colors.primary,
      fontWeight: "600",
    },
    brand: {
      alignItems: "center",
      marginBottom: 28,
    },
    brandText: {
      fontSize: 26,
      fontWeight: "700",
      letterSpacing: 6,
      color: colors.primary,
    },
    brandUnderline: {
      marginTop: 6,
      width: 36,
      height: 2,
      borderRadius: 1,
      backgroundColor: colors.primary,
      opacity: 0.8,
    },
  });
