import 'package:flutter/material.dart';

/// ChatScreen
///
/// The main UI for the multimodal chat interface.
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  bool _isRecording = false;
  bool _isUploading = false;
  bool _isAiTyping = false;

  // In a real app, this would be populated from a Riverpod provider.
  final List<Map<String, dynamic>> _messages = [
    {'role': 'assistant', 'content': 'Hello Dr. Reed. How can I assist you today?'},
  ];

  void _handleSendMessage() {
    if (_textController.text.isEmpty) return;
    setState(() {
      _messages.add({'role': 'user', 'content': _textController.text});
      _textController.clear();
      _isAiTyping = true; // Simulate AI response
    });

    // Simulate a delay for the AI response
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _isAiTyping = false;
        _messages.add({'role': 'assistant', 'content': 'Analyzing the patient data...'});
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hakim AI Orchestrator'),
        backgroundColor: Theme.of(context).colorScheme.surfaceVariant,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16.0),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isUser = message['role'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
                    decoration: BoxDecoration(
                      color: isUser ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.secondaryContainer,
                      borderRadius: BorderRadius.circular(20).subtract(isUser 
                        ? const BorderRadius.only(bottomRight: Radius.circular(20))
                        : const BorderRadius.only(bottomLeft: Radius.circular(20))),
                    ),
                    child: Text(
                      message['content'], 
                      style: TextStyle(color: isUser ? Theme.of(context).colorScheme.onPrimary : Theme.of(context).colorScheme.onSecondaryContainer),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isAiTyping) 
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(children: [CircularProgressIndicator(), SizedBox(width: 8), Text('Hakim AI is thinking...')]),
            ),
          _buildInputBar(),
        ],
      ),
    );
  }

  /// _buildInputBar
  ///
  /// The bottom bar containing the text field and action buttons.
  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        boxShadow: [BoxShadow(blurRadius: 4, color: Colors.black.withOpacity(0.1))]
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Camera/Gallery Button
            IconButton(
              icon: const Icon(Icons.camera_alt_outlined),
              onPressed: () {
                // This would trigger the HardwareService.pickAndCompressImage
                print('Camera button pressed');
              },
            ),
            // Text Input Field
            Expanded(
              child: TextField(
                controller: _textController,
                decoration: InputDecoration(
                  hintText: 'Describe symptoms or upload a file...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceVariant,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16.0),
                ),
                onSubmitted: (_) => _handleSendMessage(),
              ),
            ),
            // Microphone / Send Button
            _textController.text.isNotEmpty
              ? IconButton(icon: const Icon(Icons.send), onPressed: _handleSendMessage)
              : GestureDetector(
                  onLongPressStart: (_) {
                    setState(() => _isRecording = true);
                    // This would trigger HardwareService.startRecording
                    print('Recording started');
                  },
                  onLongPressEnd: (_) {
                    setState(() => _isRecording = false);
                    // This would trigger HardwareService.stopRecording and then ApiClient.uploadFile
                    print('Recording stopped');
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    padding: EdgeInsets.all(_isRecording ? 16 : 8),
                    decoration: BoxDecoration(
                      color: _isRecording ? Colors.red.shade200 : Theme.of(context).colorScheme.secondaryContainer,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.mic_none,
                      color: _isRecording ? Colors.red.shade800 : Theme.of(context).colorScheme.onSecondaryContainer,
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}
