import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import * as Animatable from "react-native-animatable";
import useProject from "@/hooks/useProject";
import useTheme from "@/hooks/useTheme";
import { api } from "@/lib/api";
import { createNotesStyles } from "@/assets/styles/notesList";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { router, useFocusEffect } from "expo-router";
import { useNote } from "@/hooks/useNote";

const Notes = () => {
  const { project } = useProject();
  const { colors } = useTheme();
  const styles = createNotesStyles(colors);

  const { notes, setNotes, setNote, setNoteTitle, setNoteId, setUpdateNoteCB } =
    useNote();

  useFocusEffect(
    useCallback(() => {
      if (!project?._id) {
        setNotes(null);
        return;
      }

      const fetchNotes = async () => {
        try {
          const res = await api.get(`/projects/${project._id}/notes`);

          setNotes(res.data.data);
        } catch (err) {
          console.error("Failed to fetch notes:", err);
        }
      };

      fetchNotes();
    }, [project?._id]),
  );

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await api.delete(`/projects/${project._id}/notes/${noteId}`);
      Alert.alert(res.data.data.title, res.data.message);
    } catch (err) {
      console.error("Failed to delete notes:", err);
      Alert.alert("something went wriong", "Note couldn't be deleted");
    }
  };

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={styles.mutedText}>
          Select a project first to view notes
        </Text>
      </View>
    );
  }

  if (!notes) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <Text style={styles.title}>{project.name} · Notes</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Animatable.View
            animation="pulse"
            duration={500}
            easing="ease-out-cubic"
            useNativeDriver
            style={styles.noteCard}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left block: Title + Meta */}
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.noteTitle} numberOfLines={2}>
                  {item.title || "Untitled"}
                </Text>

                <Text style={styles.metaText}>@{item.createdBy.username}</Text>
                <Text style={styles.metaText}>
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {/* Right block: Actions */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {/* Edit */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                  }}
                  onPress={() => {
                    setNoteTitle(item.title);
                    setNote(item.content);
                    setNoteId(item._id);
                    setUpdateNoteCB(true);
                    router.push("/createNote");
                  }}
                >
                  <Ionicons name="build" size={16} color={"white"}></Ionicons>
                </TouchableOpacity>

                {/* Preview */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                  onPress={() => {
                    setNoteTitle(item.title);
                    setNote(item.content);
                    setNoteId(item._id);
                    setUpdateNoteCB(true);
                    router.push("/previewNote");
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: "600" }}>
                    Preview
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: "#E53935",
                  }}
                  onPress={() => {
                    handleDeleteNote(item._id);
                  }}
                >
                  <Ionicons name="close" size={16} color={"white"}></Ionicons>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.fab}
        onPress={() => {
          setNoteTitle("");
          setNote([]);
          setNoteId("");
          setUpdateNoteCB(false);
          router.push("/createNote");
        }}
      >
        <Ionicons name="add" size={24} color={colors.surface} />
        <Text style={styles.fabText}>New Note</Text>
      </TouchableOpacity>
    </SafeScreen>
  );
};

export default Notes;
