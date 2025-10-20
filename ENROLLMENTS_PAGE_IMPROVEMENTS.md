# تحسينات صفحة التسجيلات (Enrollments Page) ✅

## التغييرات المنفذة

### 1. ✅ تحسين إدخال الدفعة (Batch Input)
**قبل:**
- قائمة منسدلة عادية (Select dropdown)
- لا توجد خاصية البحث

**بعد:**
- استخدام Autocomplete مع خاصية البحث
- عرض السعر والعملة مع اسم الدفعة
- مثال: `"دفعة A1 - 500,000 د.ع"`

```typescript
<Autocomplete
  options={batches}
  getOptionLabel={(option) => {
    const currency = option.currency === "USD" ? "$" : "د.ع"
    const price = option.actual_price ? ` - ${option.actual_price.toLocaleString()} ${currency}` : ""
    return `${option.name}${price}`
  }}
  // ...
/>
```

---

### 2. ✅ تحسين إدخال رمز الخصم (Discount Code)
**قبل:**
- حقل نصي عادي (TextField)
- إدخال يدوي للرمز
- لا يوجد فلترة حسب العملة

**بعد:**
- Autocomplete مع قائمة الخصومات المتاحة
- خاصية البحث في الأكواد
- فلترة تلقائية حسب عملة الدفعة المحددة
- عرض نوع الخصم (نسبة مئوية أو مبلغ ثابت)

```typescript
<Autocomplete
  options={getFilteredDiscountCodes(enrollmentForm.batch_id)}
  getOptionLabel={(option) => {
    let label = `${option.code} - ${option.name}`
    if (option.percent) {
      label += ` (${option.percent}%)`
    } else if (option.amount) {
      const currency = option.currency === "USD" ? "$" : "د.ع"
      label += ` (${option.amount} ${currency})`
    }
    return label
  }}
  // ...
/>
```

#### منطق الفلترة:
```typescript
const getFilteredDiscountCodes = (batchId: number): DiscountCode[] => {
  const batch = batches.find(b => b.id === batchId)
  if (!batch) return discountCodes.filter(d => d.active)

  return discountCodes.filter(d => {
    if (!d.active) return false
    // If discount has no currency, it can be used anywhere
    if (!d.currency) return true
    // If batch has no currency, allow all discounts
    if (!batch.currency) return true
    // Otherwise, currencies must match
    return d.currency === batch.currency
  })
}
```

**الشرط:**
```typescript
if (discountCode.currency !== null && discountCode.currency === batch.currency)
```

---

### 3. ✅ حساب المبلغ الإجمالي تلقائياً
**قبل:**
- إدخال يدوي للمبلغ
- لا يوجد حساب تلقائي

**بعد:**
- حساب تلقائي بناءً على:
  - سعر الدفعة (`batch.actual_price`)
  - رمز الخصم (إن وُجد)
- الحقل معطل (disabled) للمستخدم
- رسالة مساعدة توضح أنه يحسب تلقائياً

```typescript
const calculateTotalPrice = (batchId: number, discountCode: string): number | undefined => {
  const batch = batches.find(b => b.id === batchId)
  if (!batch || !batch.actual_price) return undefined

  let totalPrice = batch.actual_price

  // Apply discount if code is provided
  if (discountCode) {
    const discount = discountCodes.find(d => d.code === discountCode)
    if (discount && discount.active) {
      // Check currency match
      if (discount.currency && batch.currency && discount.currency !== batch.currency) {
        return totalPrice // Don't apply discount if currencies don't match
      }

      // Apply discount based on type
      if (discount.percent) {
        totalPrice = totalPrice - (totalPrice * discount.percent / 100)
      } else if (discount.amount) {
        totalPrice = totalPrice - discount.amount
      }
    }
  }

  return Math.max(0, totalPrice) // Ensure non-negative
}
```

#### أمثلة الحساب:
- **سعر الدفعة:** 500,000 د.ع
- **خصم نسبة مئوية (10%):** 500,000 - (500,000 × 10%) = 450,000 د.ع
- **خصم مبلغ ثابت (50,000 د.ع):** 500,000 - 50,000 = 450,000 د.ع

---

### 4. ✅ منع استخدام أكواد خصم بعملة مختلفة
**المشكلة:**
- إمكانية استخدام كود خصم بالدولار على دفعة بالدينار العراقي

**الحل:**
- فلترة أكواد الخصم بناءً على عملة الدفعة المحددة
- عرض الأكواد المتوافقة فقط في القائمة
- منع تطبيق الخصم إذا كانت العملات مختلفة

```typescript
// In getFilteredDiscountCodes
if (!d.currency) return true // Universal discount
if (!batch.currency) return true // Allow all if batch has no currency
return d.currency === batch.currency // Match currencies
```

---

### 5. ✅ إزالة Snackbar من Hook
**قبل:**
- لا يوجد snackbar في الـ hook أصلاً ✅

**بعد:**
- إضافة Snackbar في الصفحة نفسها
- عرض رسائل النجاح والخطأ

```typescript
const [snackbar, setSnackbar] = useState<{ 
  open: boolean; 
  message: string; 
  severity: "success" | "error" 
}>({
  open: false,
  message: "",
  severity: "success",
})

// في handleSubmit
setSnackbar({ open: true, message: "تم إضافة التسجيل بنجاح", severity: "success" })

// في handleDelete
setSnackbar({ open: true, message: "تم حذف التسجيل بنجاح", severity: "success" })
```

---

### 6. ✅ حل مشكلة "total_price must be a number"
**المشكلة:**
- عند التعديل بدون تغيير البيانات، يظهر خطأ validation

**السبب:**
- إرسال `total_price` كـ string أو undefined

**الحل:**
```typescript
const cleanPayload: any = {
  student_id: formData.student_id,
  batch_id: formData.batch_id,
  user_id: formData.user_id,
  status: formData.status,
}

// Only add optional fields if they have values
if (formData.total_price !== undefined && formData.total_price !== null) {
  cleanPayload.total_price = Number(formData.total_price)
}
```

**التحسينات:**
- تحويل `total_price` إلى `Number` صريح
- عدم إرسال الحقل إذا كان `undefined` أو `null`
- تنظيف البيانات قبل الإرسال

---

## الملفات المعدلة

### 1. `src/pages/EnrollmentsPage.tsx`
- إضافة Autocomplete للدفعة
- إضافة Autocomplete لرمز الخصم مع فلترة حسب العملة
- حساب تلقائي للمبلغ الإجمالي
- تعطيل حقل المبلغ الإجمالي
- إضافة Snackbar للإشعارات
- تحسين منطق الحفظ والتحديث

### 2. `src/hooks/useDiscountCodes.ts` (جديد)
```typescript
import { useState, useEffect } from 'react';
import { discountCodesAPI } from '../api/discountCodesAPI';
import type { DiscountCode } from '../types/discount';

export const useDiscountCodes = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);
      const response = await discountCodesAPI.getAll();
      setDiscountCodes(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch discount codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  return { discountCodes, loading, error, refetch: fetchDiscountCodes };
};
```

### 3. `src/types/academic.ts`
إضافة خاصية `currency` لـ Batch:
```typescript
export interface Batch {
  // ... existing fields
  actual_price?: number
  currency?: "USD" | "IQD" // ✅ Added
  // ...
}
```

---

## اختبار التحسينات

### ✅ سيناريو 1: إضافة تسجيل جديد
1. فتح Dialog
2. البحث واختيار طالب من Autocomplete
3. البحث واختيار دفعة من Autocomplete
4. (اختياري) اختيار رمز خصم - يظهر فقط الأكواد المتوافقة مع عملة الدفعة
5. مشاهدة المبلغ الإجمالي يحسب تلقائياً
6. حفظ → ظهور رسالة نجاح

### ✅ سيناريو 2: استخدام خصم نسبة مئوية
- دفعة بسعر 500,000 د.ع
- خصم 10%
- المبلغ الإجمالي = 450,000 د.ع

### ✅ سيناريو 3: استخدام خصم مبلغ ثابت
- دفعة بسعر 500,000 د.ع
- خصم 50,000 د.ع
- المبلغ الإجمالي = 450,000 د.ع

### ✅ سيناريو 4: منع استخدام عملة مختلفة
- دفعة بالدينار العراقي (IQD)
- عند اختيار رمز خصم، يظهر فقط:
  - أكواد بالدينار العراقي
  - أكواد بدون عملة محددة (عامة)
- لا تظهر أكواد الخصم بالدولار

### ✅ سيناريو 5: تعديل تسجيل موجود
1. الضغط على Edit
2. تعديل أو عدم تعديل البيانات
3. حفظ → لا يظهر خطأ validation
4. رسالة نجاح

### ✅ سيناريو 6: حذف تسجيل
1. الضغط على Delete
2. تأكيد الحذف
3. رسالة نجاح

---

## الميزات الجديدة

### 🔍 بحث محسّن
- بحث في اسم الطالب ورقم الهاتف
- بحث في اسم الدفعة
- بحث في رمز الخصم

### 💰 حماية من الأخطاء المالية
- منع استخدام أكواد بعملة مختلفة
- حساب دقيق للمبلغ الإجمالي
- التحقق من صحة البيانات قبل الإرسال

### 🎨 تحسين تجربة المستخدم
- عرض السعر مع اسم الدفعة
- عرض نوع الخصم مع رمز الخصم
- رسائل واضحة للنجاح والخطأ
- حقل المبلغ الإجمالي معطل (read-only) لمنع التعديل اليدوي

### 🔄 تحديث تلقائي
- عند تغيير الدفعة → تحديث العملة والمبلغ
- عند تغيير رمز الخصم → إعادة حساب المبلغ
- فلترة ديناميكية لأكواد الخصم

---

## الحالات الخاصة

### حالة 1: دفعة بدون سعر
- لا يتم حساب المبلغ الإجمالي
- يظهر الحقل فارغاً

### حالة 2: كود خصم غير نشط
- لا يظهر في القائمة
- لا يُطبّق على الحساب

### حالة 3: كود خصم بدون عملة
- يظهر لجميع الدفعات
- يعتبر كود "عام" (Universal)

### حالة 4: خصم أكبر من السعر
- يتم ضبط المبلغ إلى 0
- استخدام `Math.max(0, totalPrice)`

---

## التوافق مع Backend

### API Endpoints المستخدمة
```
GET  /enrollments          - قائمة التسجيلات
POST /enrollments          - إضافة تسجيل
PATCH /enrollments/:id     - تعديل تسجيل
DELETE /enrollments/:id    - حذف تسجيل
GET  /discount-codes       - قائمة أكواد الخصم
```

### البيانات المرسلة (Create/Update)
```typescript
{
  student_id: number,
  batch_id: number,
  user_id: number,
  status: "pending" | "accepted" | "dropped" | "completed",
  discount_code?: string,
  total_price?: number,      // محسوب تلقائياً
  currency?: "USD" | "IQD",  // من الدفعة
  enrolled_at?: string,
  notes?: string
}
```

---

## ملاحظات مهمة

1. **العملة تُحدد من الدفعة:** يتم نسخ العملة من الدفعة المحددة تلقائياً
2. **الحساب التلقائي:** لا يمكن تعديل المبلغ الإجمالي يدوياً
3. **الفلترة الذكية:** أكواد الخصم مفلترة حسب العملة والحالة النشطة
4. **الأمان:** تنظيف البيانات قبل الإرسال لتجنب أخطاء Validation

---

**تاريخ التحديث:** 20 أكتوبر 2025  
**الحالة:** مكتمل ✅
