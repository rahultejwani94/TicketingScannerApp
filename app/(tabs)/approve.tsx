import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getPendingTickets,
  approveTicket,
  rejectTicket,
} from "../../services/api";

export default function ApproveScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
  useCallback(() => {
    loadData("");   // always fresh load
  }, [])
);

  const loadData = async (searchText = search) => {
    try {
      const data = await getPendingTickets();
      setTickets(data);
      applySearch(searchText, data);
    } catch (err) {
      console.log("Error loading tickets", err);
    }
  };

  // 🔍 SEARCH (name + UTR)
  const applySearch = (text: string, source = tickets) => {
    setSearch(text);

    if (!text.trim()) {
      setFiltered(source);
      return;
    }

    const q = text.toLowerCase();

    const result = source.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.utr?.toLowerCase().includes(q)
      );
    });

    setFiltered(result);
  };

  // 🔄 REFRESH
  const onRefresh = async () => {
    setRefreshing(true);
    setSearch(""); // clear UI
    await loadData(""); // pass empty search
    setRefreshing(false);
  };

  const handleApprove = async (item: any) => {
    try {
      await approveTicket(item.uuid);

      Alert.alert("Success", "Ticket Approved ✅"); // ✅ here

      setSearch(""); // optional: reset search
      // 🔥 Always reload fresh data after approve
      await loadData("");      
    } catch (err) {
      console.log("Approve error", err);
    }
  };

  const handleReject = async (item: any) => {
    try {
      await rejectTicket(item.uuid);

      // reload fresh data
      await loadData("");
      setSearch("");
    } catch (err) {
      console.log("Reject error", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* HEADER */}
        <Text style={styles.header}>Pending Tickets: {filtered.length}</Text>

        {/* SEARCH */}
        <TextInput
          style={styles.search}
          placeholder="Search by name or UTR"
          value={search}
          onChangeText={applySearch}
        />

        {/* LIST */}
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => item.rowIndex || index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* NAME */}
              <Text style={styles.name}>{item.name}</Text>

              {/* UTR (replaces UUID) */}
              <Text style={styles.info}>UTR: {item.utr}</Text>

              {/* Ticket Number */}
              <Text style={styles.info}>Ticket No: {item.ticketNumber}</Text>

              {/* Ticket Count */}
              <Text style={styles.info}>Total Tickets: {item.ticketCount}</Text>

              {/* Total Amount */}
              <Text style={styles.amount}>₹ {item.totalAmount}</Text>
              <View style={styles.actionRow}>
                {/* APPROVE */}
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(item)}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>

                {/* DENY */}
                <TouchableOpacity
                  style={styles.denyBtn}
                  onPress={() => {
                    Alert.alert(
                      "Reject Ticket",
                      "Are you sure you want to reject this ticket?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Yes",
                          style: "destructive",
                          onPress: () => handleReject(item),
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.buttonText}>Deny</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  info: {
    color: "#555",
    marginTop: 3,
  },

  amount: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },

  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  approveBtn: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },

  denyBtn: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
});
