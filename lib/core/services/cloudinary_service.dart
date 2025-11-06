import 'dart:io';
import 'package:dio/dio.dart';
import 'package:image_picker/image_picker.dart';

import '../config/app_config.dart';

class CloudinaryService {
  static final CloudinaryService _instance = CloudinaryService._internal();
  factory CloudinaryService() => _instance;
  CloudinaryService._internal();

  final Dio _dio = Dio();

  Future<String?> uploadImage(XFile imageFile) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          imageFile.path,
          filename: imageFile.name,
        ),
        'upload_preset': 'ml_default', // You may need to create an unsigned upload preset
        'cloud_name': AppConfig.cloudinaryCloudName,
      });

      final response = await _dio.post(
        AppConfig.cloudinaryUploadUrl,
        data: formData,
      );

      if (response.statusCode == 200) {
        return response.data['secure_url'] as String;
      }
    } catch (e) {
      print('Error uploading image: $e');
    }
    return null;
  }

  Future<XFile?> pickImage({ImageSource source = ImageSource.gallery}) async {
    final ImagePicker picker = ImagePicker();
    try {
      final XFile? image = await picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );
      return image;
    } catch (e) {
      print('Error picking image: $e');
      return null;
    }
  }

  Future<String?> pickAndUploadImage({ImageSource source = ImageSource.gallery}) async {
    final image = await pickImage(source: source);
    if (image != null) {
      return await uploadImage(image);
    }
    return null;
  }
}