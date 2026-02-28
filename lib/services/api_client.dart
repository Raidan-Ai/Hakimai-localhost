import 'package:dio/dio.dart';
import './features/auth/services/auth_service.dart'; // Assuming AuthService is here

/// ApiClient
///
/// A robust and secure HTTP client for communicating with the Hakim AI backend.
/// It uses Dio for its powerful features like interceptors.
class ApiClient {
  final Dio _dio;
  final AuthService _authService;

  // The base URL for the backend API.
  // This should be loaded from an environment configuration.
  static const String _baseUrl = 'https://api.hakim.ai';

  ApiClient(this._authService) : _dio = Dio(BaseOptions(baseUrl: _baseUrl)) {
    _setupInterceptors();
  }

  /// _setupInterceptors
  ///
  /// Configures Dio interceptors for logging and authentication.
  /// Security Note: The AuthInterceptor automatically injects the JWT token
  /// into every request, preventing token leakage and simplifying API calls.
  void _setupInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Retrieve the token from secure storage.
        final token = await _authService.getToken();
        if (token != null) {
          // Add the Authorization header.
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options); // Continue with the request.
      },
      onResponse: (response, handler) {
        // You can process responses here if needed.
        return handler.next(response);
      },
      onError: (DioException e, handler) {
        // Handle errors globally, e.g., redirect to login on 401 Unauthorized.
        if (e.response?.statusCode == 401) {
          // Handle token expiration, e.g., by logging out the user.
        }
        return handler.next(e);
      },
    ));

    // Add a logger for debugging in development builds.
    _dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));
  }

  /// uploadFile
  ///
  /// Sends a multipart/form-data request to the specified endpoint.
  /// This is used for uploading images (X-rays, lab results) and audio (Scribe notes).
  ///
  /// [endpoint]: The API endpoint (e.g., '/api/chat').
  /// [filePath]: The local path to the file to be uploaded.
  /// [prompt]: Optional text to send along with the file.
  Future<Response> uploadFile(String endpoint, String filePath, {String? prompt}) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        if (prompt != null) 'prompt': prompt,
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });

      return await _dio.post(endpoint, data: formData);
    } on DioException catch (e) {
      // Handle specific Dio errors.
      print('File upload error: $e');
      rethrow;
    }
  }
  
  // Add other methods like post, get, etc. as needed.
  Future<Response> post(String endpoint, {dynamic data}) async {
      return _dio.post(endpoint, data: data);
  }
}
