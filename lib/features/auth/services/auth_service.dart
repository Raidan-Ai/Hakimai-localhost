import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:local_auth/local_auth.dart';

/// AuthService
///
/// Handles secure storage of JWT tokens and biometric authentication.
/// This service is the cornerstone of the app's client-side security.
class AuthService {
  final FlutterSecureStorage _secureStorage;
  final LocalAuthentication _localAuth;

  // Key for storing the JWT token in secure storage.
  static const _jwtKey = 'hakim_ai_jwt_token';

  AuthService(this._secureStorage, this._localAuth);

  /// --- Token Management ---

  /// saveToken
  /// Securely persists the JWT token to the device's keychain (iOS) or keystore (Android).
  Future<void> saveToken(String token) async {
    try {
      await _secureStorage.write(key: _jwtKey, value: token);
    } catch (e) {
      // In a production app, log this error to a monitoring service.
      print('Error saving token to secure storage: $e');
      rethrow;
    }
  }

  /// getToken
  /// Retrieves the JWT token from secure storage.
  Future<String?> getToken() async {
    try {
      return await _secureStorage.read(key: _jwtKey);
    } catch (e) {
      print('Error reading token from secure storage: $e');
      return null;
    }
  }

  /// deleteToken
  /// Removes the JWT token, effectively logging the user out.
  Future<void> deleteToken() async {
    try {
      await _secureStorage.delete(key: _jwtKey);
    } catch (e) {
      print('Error deleting token from secure storage: $e');
    }
  }

  /// --- Biometric Authentication ---

  /// authenticate
  ///
  /// Triggers a biometric prompt (Face ID, Fingerprint).
  /// This is crucial for HIPAA compliance, ensuring only the authorized user
  /// can access patient data after the app is backgrounded.
  ///
  /// Returns `true` if authentication is successful, `false` otherwise.
  Future<bool> authenticate() async {
    try {
      final canCheckBiometrics = await _localAuth.canCheckBiometrics;
      if (!canCheckBiometrics) {
        // In a real app, you might fall back to a PIN or password.
        // For this high-security context, we require biometrics.
        print('Biometrics not available on this device.');
        return false;
      }

      return await _localAuth.authenticate(
        localizedReason: 'Please authenticate to access Hakim AI',
        options: const AuthenticationOptions(
          stickyAuth: true, // Keep the prompt open until the user authenticates
          biometricOnly: true, // Do not allow device credentials (PIN, pattern)
        ),
      );
    } catch (e) {
      print('Biometric authentication error: $e');
      return false;
    }
  }
}
