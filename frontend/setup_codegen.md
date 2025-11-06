# Code Generation Setup (Optional)

If you want to use code generation for better type safety and performance, follow these steps:

## 1. Add Code Generation Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  json_annotation: ^4.9.0
  retrofit: ^4.1.0

dev_dependencies:
  build_runner: ^2.4.9
  json_serializable: ^6.8.0
  retrofit_generator: ^8.1.0
```

## 2. Update Model Files

Replace the manual JSON serialization in model files with annotations:

```dart
import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  // ... existing code
  
  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
```

## 3. Update API Service

Replace the manual HTTP calls with Retrofit annotations:

```dart
import 'package:retrofit/retrofit.dart';

part 'api_service.g.dart';

@RestApi(baseUrl: "http://10.0.2.2:9002/api")
abstract class ApiService {
  factory ApiService(Dio dio, {String baseUrl}) = _ApiService;

  @POST('/auth/login')
  Future<Map<String, dynamic>> login(@Body() Map<String, dynamic> body);
  
  // ... other endpoints
}
```

## 4. Run Code Generation

```bash
flutter packages pub run build_runner build
```

## Current Implementation

The current implementation uses manual JSON serialization and HTTP calls for simplicity and to avoid code generation setup. This works perfectly fine for development and production use.

The manual implementation provides:
- ✅ Full type safety
- ✅ Error handling
- ✅ Easy debugging
- ✅ No build step required
- ✅ Faster development iteration

You can switch to code generation later if needed for larger projects.