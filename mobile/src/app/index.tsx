
import { useState } from "react";
import * as reactNative from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

import { login } from "../prueba/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      reactNative.Alert.alert("Atención", "Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(email.trim(), password);

      if (!data.success || !data.token) {
        throw new Error("Respuesta de autenticación inválida.");
      }

      await SecureStore.setItemAsync("treowallet_token", data.token);
      
        router.replace("/dashboard");


    } catch (error) {
      reactNative.Alert.alert(
        "Error de inicio de sesión",
        error instanceof Error
          ? error.message
          : "No se pudo conectar con el servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <reactNative.KeyboardAvoidingView
      style={styles.container}
      behavior={reactNative.Platform.OS === "ios" ? "padding" : undefined}
    >
      <reactNative.ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <reactNative.View style={styles.logoContainer}>
          <reactNative.Text style={styles.logo}>T</reactNative.Text>
        </reactNative.View>

        <reactNative.Text style={styles.title}>Treo Wallet</reactNative.Text>
        <reactNative.Text style={styles.subtitle}>
          Tu dinero, bajo tu control.
        </reactNative.Text>

        <reactNative.View style={styles.form}>
          <reactNative.Text style={styles.welcome}>Bienvenido</reactNative.Text>
          <reactNative.Text style={styles.description}>
            Inicia sesión en tu cuenta
          </reactNative.Text>

          <reactNative.Text style={styles.label}>Correo electrónico</reactNative.Text>

          <reactNative.TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <reactNative.Text style={styles.label}>Contraseña</reactNative.Text>

          <reactNative.TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <reactNative.Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <reactNative.ActivityIndicator color="#FFFFFF" />
            ) : (
              <reactNative.Text style={styles.buttonText}>Iniciar sesión</reactNative.Text>
            )}
          </reactNative.Pressable>
        </reactNative.View>

        <reactNative.Text style={styles.footer}>
          © 2026 Treo Wallet
        </reactNative.Text>
      </reactNative.ScrollView>
    </reactNative.KeyboardAvoidingView>
  );
}

const styles = reactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "bold",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  form: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    elevation: 3,
  },
  welcome: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#0F172A",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 20,
  },
  button: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 35,
  },
});
