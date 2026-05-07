import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { getAllTickets } from "../../services/api";

export default function DashboardScreen() {
  const [data, setData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load(); // always fetch fresh data when screen opens
    }, []),
  );

  const load = async () => {
    try {
      const res = await getAllTickets();
      setData(res);
    } catch (err) {
      console.log("Dashboard load error", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const normalize = (s: string) => s?.toLowerCase().trim();

  // 📊 DERIVED STATS
  const totalTickets = data.length;

  const totalBookings = new Set(data.map((t) => t.bookingId)).size;

  const totalRevenue = Array.from(
    new Map(
      data
        .filter(
          (t) =>
            normalize(t.status) !== "rejected" &&
            normalize(t.paymentType) !== "free",
        )
        .map((t) => [t.bookingId, t]),
    ).values(),
  ).reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

  const pending = data.filter((t) => normalize(t.status) === "pending").length;

  const approved = data.filter((t) => normalize(t.status) === "valid").length;

  const rejected = data.filter(
    (t) => normalize(t.status) === "rejected",
  ).length;

  const checkedIn = data.filter(
    (t) => normalize(t.status) === "checked in",
  ).length;

  const freeTickets = data.filter((t) => t.paymentType === "FREE").length;

  const paidTickets = data.filter(
    (t) => normalize(t.paymentType) !== "free",
  ).length;

  const totalTicketsDisplay = `${totalTickets} (${paidTickets} Paid + ${freeTickets} Free)`;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>📊 Dashboard</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Total Bookings</Text>
          <Text style={styles.value}>{totalBookings}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Total Tickets</Text>
          <Text style={styles.value}>{totalTicketsDisplay}</Text>
          <Text style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            Free tickets are included but not counted in revenue
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Total Revenue</Text>
          <Text style={styles.value}>₹ {totalRevenue}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Pending Tickets</Text>
          <Text style={[styles.value, { color: "#ff9800" }]}>{pending}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Approved Tickets</Text>
          <Text style={[styles.value, { color: "#4CAF50" }]}>{approved}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Rejected Tickets</Text>
          <Text style={[styles.value, { color: "#f44336" }]}>{rejected}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Checked In</Text>
          <Text style={[styles.value, { color: "#2196F3" }]}>{checkedIn}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Free Tickets</Text>
          <Text style={[styles.value, { color: "#9C27B0" }]}>
            {freeTickets}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    color: "#666",
  },

  value: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
  },
});
