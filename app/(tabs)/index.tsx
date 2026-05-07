import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Text,
  View,
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { scanTicket } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScannerScreen() {
  const [manualUUID, setManualUUID] = useState("");
  const [mode, setMode] = useState<"SCAN" | "MANUAL">("SCAN");

  const [permission, requestPermission] = useCameraPermissions();
  const [message, setMessage] = useState("Scan a QR Code");
  const [flashColor, setFlashColor] = useState("transparent");

  const scanning = useRef(false);
  const scanLine = useRef(new Animated.Value(0)).current;

  const SCAN_BOX_HEIGHT = 200;

  useEffect(() => {
    requestPermission();

    Animated.loop(
      Animated.timing(scanLine, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const handleScan = async ({ data }: any) => {
    if (!data) {
      setMessage("⚠️ Enter valid UUID");
      return;
    }

    if (scanning.current) return;
    scanning.current = true;

    try {
      const result = await scanTicket(data);

      if (result.status === "VALID") {
        setFlashColor("green");
        setMessage(`✅ Welcome ${result.name}`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else if (result.status === "ALREADY_SCANNED") {
        setFlashColor("red");
        setMessage("⚠️ Already checked in");
      } else if (result.status === "NOT_APPROVED") {
        setFlashColor("red");
        setMessage("❌ Not approved");
      } else if (result.status === "REJECTED") {
        setFlashColor("red");
        setMessage("❌ Rejected");
      } else {
        setFlashColor("red");
        setMessage("❌ Invalid ticket");
      }
    } catch {
      setMessage("⚠️ Network error");
    }

    setTimeout(() => {
      setFlashColor("transparent");
      scanning.current = false;
      setMessage("Scan next ticket");
    }, 2000);
  };

  if (!permission) return <Text>Requesting permission...</Text>;
  if (!permission.granted) return <Text>No camera access</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === "SCAN" && styles.activeToggle]}
              onPress={() => setMode("SCAN")}
            >
              <Text style={styles.toggleText}>Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === "MANUAL" && styles.activeToggle,
              ]}
              onPress={() => setMode("MANUAL")}
            >
              <Text style={styles.toggleText}>Manual</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================== SCAN MODE ================== */}
        {mode === "SCAN" && (
          <View style={{ flex: 1 }}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={handleScan}
            />

            {/* Scan Box */}
            <View style={styles.scanBox} />

            {/* Scan Line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanLine.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, SCAN_BOX_HEIGHT - 2],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Mask */}
            <View style={styles.maskTop} />
            <View style={styles.maskBottom} />
            <View style={styles.maskLeft} />
            <View style={styles.maskRight} />

            {/* Message */}
            <View style={styles.overlay}>
              <Text style={styles.title}>Scan Ticket</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Flash */}
            <View style={[styles.flash, { backgroundColor: flashColor }]} />
          </View>
        )}

        {/* ================== MANUAL MODE ================== */}
        {mode === "MANUAL" && (
          <View style={styles.manualContainer}>
            <Text style={styles.manualTitle}>Enter UUID</Text>

            <TextInput
              placeholder="Enter UUID"
              style={styles.input}
              value={manualUUID}
              onChangeText={setManualUUID}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => {
                if (!manualUUID.trim()) {
                  setMessage("⚠️ Enter valid UUID");
                  return;
                }

                handleScan({ data: manualUUID });
                setManualUUID("");
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  activeToggle: {
    backgroundColor: "#4CAF50",
  },

  overlay: {
    position: "absolute",
    top: 60,
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },

  message: {
    fontSize: 16,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  scanBox: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: "80%",
    height: 200,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
  },

  scanLine: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: "80%",
    height: 2,
    backgroundColor: "red",
  },

  flash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },

  /* MANUAL MODE */
  manualContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  manualTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  submitBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  messageManual: {
    marginTop: 15,
    textAlign: "center",
  },

  /* MASK */
  maskTop: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "30%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  maskBottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  maskLeft: {
    position: "absolute",
    top: "30%",
    left: 0,
    width: "10%",
    height: 200,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  maskRight: {
    position: "absolute",
    top: "30%",
    right: 0,
    width: "10%",
    height: 200,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  toggleContainer: {
    position: "absolute",
    top: 10,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 5,
  },

  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
  },

  toggleText: {
    color: "white",
    fontWeight: "bold",
  },
});
