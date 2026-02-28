import 'dart:io';
import 'package:image/image.dart' as img;
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

/// HardwareService
///
/// A utility class to abstract hardware interactions like camera and microphone.
/// This keeps the UI layer clean from hardware-specific logic.
class HardwareService {
  final ImagePicker _picker = ImagePicker();
  final AudioRecorder _audioRecorder = AudioRecorder();

  /// --- Camera & Image Processing ---

  /// pickAndCompressImage
  ///
  /// Opens the device's camera or gallery, allows the user to select an image,
  /// and then compresses it to a manageable size for network transmission.
  ///
  /// Security Note: Compressing images reduces the attack surface and data transfer size,
  /// which is vital for performance and security in a clinical setting.
  ///
  /// Returns a compressed JPEG file, or null if no image was selected.
  Future<File?> pickAndCompressImage({ImageSource source = ImageSource.camera}) async {
    try {
      final XFile? imageFile = await _picker.pickImage(source: source);

      if (imageFile == null) return null;

      // Read the image file into memory
      final imageBytes = await imageFile.readAsBytes();
      final image = img.decodeImage(imageBytes);

      if (image == null) return null;

      // Resize the image to a max width of 1080p for efficiency
      final resizedImage = img.copyResize(image, width: 1080);

      // Get a temporary directory to store the compressed file
      final tempDir = await getTemporaryDirectory();
      final compressedFile = File('${tempDir.path}/${DateTime.now().millisecondsSinceEpoch}.jpg');

      // Encode as JPEG with a quality of 85. This offers a good balance
      // between file size and image quality for clinical photos.
      await compressedFile.writeAsBytes(img.encodeJpg(resizedImage, quality: 85));

      return compressedFile;
    } catch (e) {
      print('Error picking/compressing image: $e');
      return null;
    }
  }

  /// --- Audio Recording ---

  /// startRecording
  ///
  /// Begins recording audio from the device's microphone.
  /// The audio is saved in a temporary file.
  Future<void> startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final tempDir = await getTemporaryDirectory();
        final path = '${tempDir.path}/scribe_note_${DateTime.now().millisecondsSinceEpoch}.m4a';
        
        // Start recording to a file with a high-quality AAC codec.
        await _audioRecorder.start(const RecordConfig(), path: path);
      }
    } catch (e) {
      print('Error starting audio recording: $e');
    }
  }

  /// stopRecording
  ///
  /// Stops the audio recording and returns the path to the saved file.
  /// Returns null if the recording was not active.
  Future<String?> stopRecording() async {
    try {
      return await _audioRecorder.stop();
    } catch (e) {
      print('Error stopping audio recording: $e');
      return null;
    }
  }

  /// dispose
  /// Releases resources used by the audio recorder.
  void dispose() {
    _audioRecorder.dispose();
  }
}
