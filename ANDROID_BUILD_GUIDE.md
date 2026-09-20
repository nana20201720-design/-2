# 🛠️ الدليل التقني لبناء APK احترافي (Gradle & R8)

لضمان أن تطبيقك بأصغر حجم ممكن وأعلى أداء، اتبع هذه الأوامر داخل مجلد `android` في مشروعك.

---

## 🧹 1. تنظيف المشروع (Clean)
قبل كل بناء جديد، من الضروري مسح الملفات المؤقتة القديمة لتجنب التعارضات.
```bash
./gradlew clean
```

## 🚀 2. بناء APK محسن (R8 Shrinking)
للحصول على نسخة "Release" نهائية، صغيرة الحجم، ومشفرة (Obfuscated) لرفعها على Google Play:
```bash
./gradlew assembleRelease
```
*   **ماذا يفعل R8؟** يقوم بحذف الكود غير المستخدم، وتقليص حجم الصور، وضغط ملفات اللعبة لأقصى درجة.

## 📦 3. بناء Android App Bundle (المفضل للمتجر)
إذا كنت ستقوم بالرفع مباشرة على متجر Google Play، يفضل استخدام صيغة `.aab`:
```bash
./gradlew bundleRelease
```

---

## ⚙️ إعدادات الأداء في `build.gradle` (تم تجهيزها لك)
تأكد من أن ملف `android/app/build.gradle` يحتوي على هذه الإعدادات لتفعيل R8:

```gradle
android {
    ...
    buildTypes {
        release {
            minifyEnabled true      // تفعيل تقليص الكود
            shrinkResources true   // حذف الصور والملفات غير المستخدمة
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 📍 أين تجد الملف النهائي؟
بعد انتهاء الأوامر، ستجد ملف الـ APK في هذا المسار:
`android/app/build/outputs/apk/release/app-release.apk`

---
**💡 نصيحة:** إذا كنت تستخدم Windows، استخدم `gradlew` بدلاً من `./gradlew`.
