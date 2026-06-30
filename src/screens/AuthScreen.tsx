import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setError(friendlyError(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>🧤</Text>
          <Text style={styles.title}>GK Stats</Text>
          <Text style={styles.subtitle}>Goalkeeper Performance Tracker</Text>

          <View style={styles.form}>
            <Text style={styles.formTitle}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#6e7681"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6e7681"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              <Text style={styles.switchBtnText}>
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} disabled={loading}>
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>
            <Text style={styles.guestNote}>
              Guest stats are stored locally only and won't sync across devices.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function friendlyError(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Console.',
    'auth/unauthorized-domain': 'This domain is not authorised in Firebase Console → Authentication → Settings → Authorised domains.',
    'auth/invalid-credential': 'Invalid credentials. Check your email and password.',
    'auth/invalid-api-key': 'Invalid Firebase API key. Check your environment variables.',
  };
  return messages[code] ?? `Something went wrong (${code}). Please try again.`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1117' },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logo: { fontSize: 72, textAlign: 'center', marginBottom: 12 },
  title: {
    color: '#e6edf3',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 40 },
  form: {
    backgroundColor: '#161b22',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  formTitle: {
    color: '#e6edf3',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 10,
    padding: 14,
    color: '#e6edf3',
    fontSize: 15,
    marginBottom: 12,
  },
  error: {
    color: '#ff1744',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#00e676',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  switchBtn: { paddingVertical: 14, alignItems: 'center' },
  switchBtnText: { color: '#8b949e', fontSize: 13 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#30363d' },
  dividerText: { color: '#6e7681', fontSize: 12 },
  guestBtn: {
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  guestBtnText: { color: '#8b949e', fontSize: 15, fontWeight: '600' },
  guestNote: {
    color: '#6e7681',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
});
