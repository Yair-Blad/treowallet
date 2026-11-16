
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

import {
  getAccounts,
  getBeneficiaries,
  createTransfer,
  Account,
  Beneficiary,
} from "../../prueba/api";

import {
  getPendingTransfer,
  savePendingTransfer,
  clearPendingTransfer,
  PendingTransfer,
} from "../../prueba/transfer-storage";

const formatMoney = (value: number | string) =>
  Number(value).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function TransfersScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const [accountId, setAccountId] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");

  const [pendingTransfer, setPendingTransfer] =
    useState<PendingTransfer | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = await SecureStore.getItemAsync("treowallet_token");

      if (!token) {
        router.replace("/");
        return;
      }

      const [accountsData, beneficiariesData, pending] =
        await Promise.all([
          getAccounts(token),
          getBeneficiaries(token),
          getPendingTransfer(),
        ]);

      if (!accountsData.success || !beneficiariesData.success) {
        throw new Error("No fue posible consultar la información.");
      }

      setAccounts(accountsData.accounts);
      setBeneficiaries(beneficiariesData.beneficiaries);
      setPendingTransfer(pending);

      if (pending) {
        setAccountId(pending.transfer.account_id);
        setBeneficiaryId(pending.transfer.beneficiary_id);
        setAmount(pending.transfer.amount);
      } else {
        setAccountId(accountsData.accounts[0]?.id || "");
        setBeneficiaryId(
          beneficiariesData.beneficiaries[0]?.id || ""
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar la información."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const normalizeAmount = (value: string): string | null => {
    const cleanValue = value.trim().replace(",", ".");

    if (!/^\d{1,12}(\.\d{1,2})?$/.test(cleanValue)) {
      return null;
    }

    const [integer, decimals = ""] = cleanValue.split(".");
    const normalized = `${integer}.${decimals.padEnd(2, "0")}`;

    if (Number(normalized) <= 0) {
      return null;
    }

    return normalized;
  };

  const handleTransfer = async () => {
    if (submitting) return;

    if (!pendingTransfer) {
      if (!beneficiaryId || !accountId) {
        Alert.alert(
          "Atención",
          "Selecciona un beneficiario y una cuenta de origen."
        );
        return;
      }

      if (!normalizeAmount(amount)) {
        Alert.alert(
          "Importe inválido",
          "Ingresa un importe mayor a cero con máximo dos decimales."
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      const token = await SecureStore.getItemAsync("treowallet_token");

      if (!token) {
        router.replace("/");
        return;
      }

      let operation = pendingTransfer;

      if (!operation) {
        const normalizedAmount = normalizeAmount(amount);

        if (!normalizedAmount) {
          throw new Error("El importe ingresado no es válido.");
        }

        operation = await savePendingTransfer({
          beneficiary_id: beneficiaryId,
          account_id: accountId,
          amount: normalizedAmount,
        });

        setPendingTransfer(operation);
      }

      const result = await createTransfer(
        token,
        operation.transfer,
        operation.idempotencyKey
      );

      if (!result.success) {
        throw new Error("El servidor no confirmó la transferencia.");
      }

      try {
        await clearPendingTransfer();
        setPendingTransfer(null);
        setAmount("");
      } catch {
        Alert.alert(
          "Transferencia realizada",
          "El servidor confirmó la operación, pero no se pudo limpiar el almacenamiento local. Si necesitas reintentar, se utilizará la misma clave para evitar duplicados."
        );
        return;
      }

      Alert.alert(
        "Transferencia exitosa",
        result.message || "La transferencia se realizó correctamente."
      );

      await loadData();
    } catch (err) {
      Alert.alert(
        "No se pudo completar",
        `${err instanceof Error ? err.message : "Ocurrió un error."}\n\nLa operación pendiente se conserva para permitir un reintento seguro.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          Cargando información...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>

        <Pressable style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const selectedAccount = accounts.find(
    (account) => account.id === accountId
  );

  const hasPendingTransfer = pendingTransfer !== null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Transferencias</Text>

      <Text style={styles.subtitle}>
        Envía dinero a tus beneficiarios registrados.
      </Text>

      {hasPendingTransfer && (
        <View style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>
            Transferencia pendiente
          </Text>
          <Text style={styles.pendingText}>
            Existe una operación sin confirmar. Debes reintentarla
            utilizando los mismos datos.
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Beneficiario</Text>

        {beneficiaries.length === 0 ? (
          <Text style={styles.emptyText}>
            No tienes beneficiarios registrados.
          </Text>
        ) : (
          beneficiaries.map((beneficiary) => (
            <Pressable
              key={beneficiary.id}
              disabled={hasPendingTransfer}
              onPress={() => setBeneficiaryId(beneficiary.id)}
              style={[
                styles.option,
                beneficiaryId === beneficiary.id &&
                  styles.optionSelected,
                hasPendingTransfer && styles.disabledOption,
              ]}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>
                  {beneficiary.beneficiary_name}
                </Text>
                <Text style={styles.optionDescription}>
                  {beneficiary.alias} · CLABE: {beneficiary.clabe}
                </Text>
              </View>

              {beneficiaryId === beneficiary.id && (
                <Text style={styles.check}>✓</Text>
              )}
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Cuenta de origen</Text>

        {accounts.length === 0 ? (
          <Text style={styles.emptyText}>
            No tienes cuentas disponibles.
          </Text>
        ) : (
          accounts.map((account) => (
            <Pressable
              key={account.id}
              disabled={hasPendingTransfer}
              onPress={() => setAccountId(account.id)}
              style={[
                styles.option,
                accountId === account.id && styles.optionSelected,
                hasPendingTransfer && styles.disabledOption,
              ]}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>
                  {account.account_name}
                </Text>
                <Text style={styles.optionDescription}>
                  Saldo disponible: {formatMoney(account.current_balance)}
                </Text>
              </View>

              {accountId === account.id && (
                <Text style={styles.check}>✓</Text>
              )}
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Importe a transferir</Text>

        <Text style={styles.currency}>MXN</Text>

        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          editable={!hasPendingTransfer && !submitting}
        />

        {selectedAccount && (
          <Text style={styles.balanceText}>
            Saldo disponible:{" "}
            {formatMoney(selectedAccount.current_balance)}
          </Text>
        )}
      </View>

      <Pressable
        style={[
          styles.button,
          (submitting ||
            beneficiaries.length === 0 ||
            accounts.length === 0) &&
            styles.buttonDisabled,
        ]}
        onPress={handleTransfer}
        disabled={
          submitting ||
          beneficiaries.length === 0 ||
          accounts.length === 0
        }
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            {hasPendingTransfer
              ? "Reintentar transferencia"
              : "Confirmar transferencia"}
          </Text>
        )}
      </Pressable>

      <Text style={styles.footer}>
        Las transferencias son simuladas dentro de Treo Wallet.
      </Text>
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
    paddingBottom: 40,
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
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 14,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 13,
    borderRadius: 10,
    marginBottom: 9,
  },
  optionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  disabledOption: {
    opacity: 0.7,
  },
  optionInfo: {
    flex: 1,
    paddingRight: 8,
  },
  optionTitle: {
    fontWeight: "600",
    color: "#0F172A",
    fontSize: 14,
  },
  optionDescription: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
  },
  check: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 20,
  },
  currency: {
    color: "#64748B",
    fontSize: 13,
  },
  amountInput: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0F172A",
    paddingVertical: 10,
  },
  balanceText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  pendingCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pendingTitle: {
    color: "#92400E",
    fontWeight: "bold",
    fontSize: 15,
  },
  pendingText: {
    color: "#92400E",
    fontSize: 13,
    marginTop: 5,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 15,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 18,
  },
});
