
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import {
  getDashboard,
  DashboardResponse,
  Transaction,
} from "../prueba/api";

const formatMoney = (value: number | string) =>
  Number(value).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("treowallet_token");

      setError("");

      if (!token) {
        router.replace("/");
        return;
      }

      const data = await getDashboard(token);

      if (!data.success) {
        throw new Error("No se pudo consultar el Dashboard.");
      }

      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar la información."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadDashboard());
  }, [loadDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("treowallet_token");
    router.replace("/");
  };

  const getCategoryName = (transaction: Transaction) => {
    if (typeof transaction.category === "string") {
      return transaction.category;
    }

    return transaction.category?.name || "Sin categoría";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando tu información...</Text>
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>No se pudo cargar el Dashboard</Text>
        <Text style={styles.errorText}>
          {error || "Intenta nuevamente."}
        </Text>
        <Pressable style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    );
  }

  const { summary, recentTransactions } = dashboard;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
 <View style={styles.header}>
  <View>
    <Text style={styles.greeting}>Bienvenido a</Text>
    <Text style={styles.title}>Treo Wallet</Text>
  </View>

  <View style={styles.headerActions}>
    <Pressable
      style={styles.navigationButton}
      onPress={() => router.replace("/(tabs)")}
    >
      <Text style={styles.navigationButtonText}>Menú</Text>
    </Pressable>

    <Pressable onPress={handleLogout}>
      <Text style={styles.logoutButton}>Salir</Text>
    </Pressable>
  </View>
</View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo disponible</Text>
        <Text style={styles.balance}>
          {formatMoney(summary.current_balance)}
        </Text>
        <Text style={styles.balanceFooter}>Balance de tus cuentas</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={styles.income}>
            +{formatMoney(summary.total_income)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gastos</Text>
          <Text style={styles.expense}>
            -{formatMoney(summary.total_expenses)}
          </Text>
        </View>
      </View>

      <View style={styles.movementsHeader}>
        <Text style={styles.sectionTitle}>Últimos movimientos</Text>
        <Text style={styles.count}>
          {recentTransactions.length} movimientos
        </Text>
      </View>

      {recentTransactions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Todavía no tienes movimientos registrados.
          </Text>
        </View>
      ) : (
        recentTransactions.map((transaction) => {
          const isIncome = transaction.transaction_type === "income";

          return (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionCategory}>
                  {getCategoryName(transaction)} ·{" "}
                  {formatDate(transaction.transaction_date)}
                </Text>
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  isIncome ? styles.income : styles.expense,
                ]}
              >
                {isIncome ? "+" : "-"}
                {formatMoney(transaction.amount)}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  content: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 35,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#F1F5F9",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#0F172A",
  },
  logoutButton: {
    color: "#DC2626",
    fontWeight: "600",
    padding: 10,
  },
  balanceCard: {
    backgroundColor: "#2563EB",
    padding: 25,
    borderRadius: 18,
    marginBottom: 18,
  },
  balanceLabel: {
    color: "#DBEAFE",
    fontSize: 15,
  },
  balance: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 12,
  },
  balanceFooter: {
    color: "#DBEAFE",
    fontSize: 12,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 17,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 10,
  },
  income: {
    color: "#16A34A",
    fontWeight: "bold",
  },
  expense: {
    color: "#DC2626",
    fontWeight: "bold",
  },
  movementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#0F172A",
  },
  count: {
    fontSize: 12,
    color: "#64748B",
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  transactionTitle: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 14,
  },
  transactionCategory: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 12,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "center",
  },
  errorText: {
    color: "#64748B",
    textAlign: "center",
    marginVertical: 12,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  logoutText: {
    color: "#DC2626",
    marginTop: 10,
  },

  headerActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},
navigationButton: {
  backgroundColor: "#DBEAFE",
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderRadius: 10,
},
navigationButtonText: {
  color: "#2563EB",
  fontWeight: "600",
},
});
