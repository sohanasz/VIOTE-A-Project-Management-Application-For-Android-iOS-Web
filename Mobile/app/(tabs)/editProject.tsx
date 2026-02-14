import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import * as Animatable from "react-native-animatable";

import SafeScreen from "@/components/SafeScreen";
import useTheme from "@/hooks/useTheme";
import useProject from "@/hooks/useProject";
import { api } from "@/lib/api";
import { createHomeStyles } from "@/assets/styles/home";
import { USER_ROLES } from "@/lib/constants";

export default function EditProject() {
  const route = useRoute();
  const members = route.params.members === "true";

  const { project, role } = useProject();
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  const [projectMembers, setProjectMembers] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [roleOption, setRoleOption] = useState(USER_ROLES.MEMBER);
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${project._id}/members`);

      setProjectMembers(res.data.data);
    } catch (err) {
      console.error(
        "Error while fetching member list for project",
        err.response,
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMembers();

      return () => {
        setProjectMembers(null);
      };
    }, [project]),
  );

  const handleRemoveMember = async (id: string) => {
    try {
      await api.delete(`/projects/${project._id}/members/${id}`);
      fetchMembers();
      Alert.alert("Success✅", "Member removed from project successfully");
    } catch (err) {
      Alert.alert("Uh Ohh!", err.response.data.message);
      console.error(err);
    }
  };

  const handleAddMember = async () => {
    if (!username.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/projects/${project._id}/members`, {
        usernameToAdd: username,
        role: roleOption,
      });
      setUsername("");
      fetchMembers();
      Alert.alert("Success✅", "User added successfully into project");
    } catch (err) {
      Alert.alert("Uh Ohh!", err.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderMember = ({ item }: any) => {
    if (!item.user) {
      return <></>;
    }

    return (
      <Animatable.View animation="pulse" duration={400} useNativeDriver>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
            paddingInline: 16,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: colors.text, fontSize: 14 }}>
              {item.user.fullname}
            </Text>
            <Text
              style={{
                backgroundColor: colors.primary,
                color: colors.invertedText,
                padding: 8,
                marginLeft: 4,
                borderRadius: 25,
                fontSize: 13,
                fontWeight: 700,
                textAlign: "center",
                textAlignVertical: "center",
              }}
            >
              @{item.user.username}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.primary,
                marginRight: 8,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>
                {item.role.replace("_", " ")}
              </Text>
            </TouchableOpacity>

            {role === USER_ROLES.ADMIN || role === USER_ROLES.PROJECT_ADMIN
              ? item.role !== USER_ROLES.ADMIN && (
                  <TouchableOpacity
                    onPress={() => handleRemoveMember(item.user._id)}
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                  </TouchableOpacity>
                )
              : null}
          </View>
        </View>
      </Animatable.View>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <Text style={styles.sectionTitle}>
        {role === USER_ROLES.ADMIN || role === USER_ROLES.PROJECT_ADMIN
          ? "Manage Members"
          : "Project Members"}
      </Text>
      <Text style={styles.sectionTitle}>{project.name}</Text>

      {(role === USER_ROLES.ADMIN || role === USER_ROLES.PROJECT_ADMIN) && (
        <Animatable.View
          animation="fadeInDown"
          duration={500}
          useNativeDriver
          style={{
            backgroundColor: colors.bg,
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <TextInput
            placeholder="Username"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={setUsername}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 10,
              color: colors.text,
              marginBottom: 10,
            }}
          />

          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            {[USER_ROLES.MEMBER, USER_ROLES.PROJECT_ADMIN].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRoleOption(r)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor:
                    roleOption === r ? colors.primary : colors.border,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: roleOption === r ? colors.primary : colors.text,
                  }}
                >
                  {r.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleAddMember}
            disabled={submitting}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              opacity: submitting ? 0.9 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "500" }}>
              {submitting ? "Adding..." : "Add Member"}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      )}

      {projectMembers && (
        <FlatList
          data={projectMembers}
          keyExtractor={(item) => item._id}
          renderItem={renderMember}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeScreen>
  );
}
