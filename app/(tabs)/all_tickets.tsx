import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";

import { getAllTickets, scanTicket } from "../../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function AllTicketsScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [groupedTickets, setGroupedTickets] = useState<any>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const normalize = (s: string) => s?.toLowerCase().trim();

  useFocusEffect(
    useCallback(() => {
      setSearch("");
      setActiveFilter("ALL");
      setExpanded({});
      loadTickets("", "ALL"); // fresh load every time screen opens
    }, []),
  );

  // ✅ GROUP BY bookingId
  const groupByBookingId = (data: any[]) => {
    return data.reduce((acc: any, item: any) => {
      const key = item.bookingId || "UNKNOWN";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const FILTER_STATUS_MAP: any = {
    APPROVED: "valid",
    USED: "checked in",
    PENDING: "pending",
    REJECTED: "rejected",
  };

  const statusMatch = (status: string, filter: string) => {
    if (filter === "ALL") return true;

    return normalize(status) === FILTER_STATUS_MAP[filter];
  };

  const loadTickets = async (text = search, filter = activeFilter) => {
    try {
      const data = await getAllTickets();
      setTickets(data);
      setExpanded({});
      applyFilters(text, filter, data);
    } catch (err) {
      console.log("Error loading tickets", err);
    }
  };

  // 🔍 FILTER + SEARCH
  const applyFilters = (text: string, filter: string, source = tickets) => {
    let result = [...source];

    // ✅ status filter (fixed)
    if (filter !== "ALL") {
      result = result.filter((i) => statusMatch(i.status, filter));
    }

    // ✅ search filter
    if (text.trim()) {
      const q = text.toLowerCase();
      result = result.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.utr?.toLowerCase().includes(q) ||
          i.uuid?.toLowerCase().includes(q),
      );
    }

    setGroupedTickets(groupByBookingId(result));
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    applyFilters(text, activeFilter);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    applyFilters(search, filter);
  };

  // ✅ RESET ON PULL REFRESH
  const onRefresh = async () => {
    setRefreshing(true);

    setSearch("");
    setActiveFilter("ALL");

    await loadTickets("", "ALL");

    setRefreshing(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* HEADER */}
        <Text style={styles.header}>
          Total Bookings: {Object.keys(groupedTickets).length}
        </Text>

        {/* SEARCH */}
        <TextInput
          style={styles.search}
          placeholder="Search name / UTR / UUID"
          value={search}
          onChangeText={handleSearch}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["ALL", "APPROVED", "PENDING", "USED", "REJECTED"]}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chip,
                activeFilter === item && [
                  item === "REJECTED" && styles.chipRejectedActive,
                  item === "APPROVED" && styles.chipApprovedActive,
                  item === "PENDING" && styles.chipPendingActive,
                  item === "USED" && styles.chipUsedActive,
                  item === "ALL" && styles.chipAllActive,
                ],
              ]}
              onPress={() => handleFilterChange(item)}
            >
              <Text style={styles.chipText}>{item}</Text>
            </TouchableOpacity>
          )}
        />

        {/* LIST */}
        <FlatList
          data={Object.keys(groupedTickets)}
          keyExtractor={(item) => item}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item: bookingId }) => {
            const group = groupedTickets[bookingId];

            const totalAmount = group[0]?.totalAmount || 0;

            const checkedIn = group.filter(
              (t: any) => normalize(t.status) === "checked in",
            ).length;

            const isExpanded = expanded[bookingId];

            return (
              <View style={styles.groupCard}>
                {/* HEADER */}
                <TouchableOpacity onPress={() => toggleExpand(bookingId)}>
                  <Text style={styles.bookingName}>
                    {group[0]?.name || "Unknown User"}
                  </Text>

                  <Text style={styles.amount}>
                    ₹ {totalAmount} • {checkedIn}/{group.length} checked-in
                  </Text>
                </TouchableOpacity>

                {/* CHILDREN */}
                {isExpanded &&
                  group.map((item: any) => (
                    <View key={item.uuid} style={styles.childCard}>
                      <Text style={styles.name}>{item.name}</Text>

                      <Text style={styles.info}>UTR: {item.utr}</Text>

                      <Text style={styles.info}>
                        Ticket No: {item.ticketNumber}
                      </Text>

                      <Text
                        style={[
                          styles.status,
                          item.status === "Rejected" && { color: "red" },
                          item.status === "Valid" && { color: "green" },
                          item.status === "Checked In" && { color: "blue" },
                        ]}
                      >
                        Status: {item.status}
                      </Text>

                      {/* ACTIONS ONLY FOR APPROVED */}
                      {normalize(item.status) === "valid" && (
                        <View style={styles.actionRow}>
                          {/* COPY */}
                          <TouchableOpacity
                            onPress={() => {
                              Clipboard.setStringAsync(item.uuid);
                              Alert.alert("Copied");
                            }}
                            style={styles.iconBtn}
                          >
                            <Text>📋 Copy</Text>
                          </TouchableOpacity>

                          {/* CHECK-IN */}
                          <TouchableOpacity
                            style={styles.checkInBtn}
                            onPress={async () => {
                              await scanTicket(item.uuid);
                              Alert.alert("Checked In");
                              loadTickets();
                            }}
                          >
                            <Text style={{ color: "white" }}>📷 Check-in</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
              </View>
            );
          }}
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

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
    height: 32, // ✅ FIX: prevents squeezing
    justifyContent: "center", // ✅ centers text vertically
    alignItems: "center", // ✅ centers text horizontally
  },

  chipActive: {
    backgroundColor: "#4CAF50",
  },

  chipText: {
    color: "#333",
    fontWeight: "500",
  },

  groupCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  bookingName: {
    fontSize: 16,
    fontWeight: "bold",
  },

  amount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2e7d32",
    marginTop: 4,
  },

  childCard: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
  },

  info: {
    color: "#555",
    marginTop: 2,
  },

  status: {
    marginTop: 3,
    color: "#666",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  iconBtn: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
  },

  checkInBtn: {
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 8,
  },

  chipRejected: {
    backgroundColor: "#f44336",
  },

  chipRejectedInactive: {
    backgroundColor: "#eee", // grey when not selected
  },

  chipAllActive: {
    backgroundColor: "#2196F3",
  },

  chipApprovedActive: {
    backgroundColor: "#4CAF50",
  },

  chipPendingActive: {
    backgroundColor: "#FF9800",
  },

  chipUsedActive: {
    backgroundColor: "#9C27B0",
  },

  chipRejectedActive: {
    backgroundColor: "#F44336",
  },
});
