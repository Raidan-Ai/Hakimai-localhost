import React from 'react';
import { ShieldAlert, Scale, FileCheck } from 'lucide-react';

export function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl border border-[#141414]/5 shadow-sm" dir="rtl">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="text-amber-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#141414]">إخلاء المسؤولية القانونية</h1>
          <p className="text-sm text-[#141414]/40">نظام حكيم للذكاء الاصطناعي (Hakim AI)</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-[#141414]/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">1. أداة مساعدة لاتخاذ القرار السريري</h2>
          <p>
            يعد نظام "حكيم" (Hakim AI) أداة تقنية متطورة مصممة لدعم اتخاذ القرار السريري فقط. إن المعلومات والتحليلات التي يقدمها النظام تهدف إلى مساعدة الطبيب المرخص ولا تشكل بأي حال من الأحوال تشخيصاً نهائياً أو وصفة طبية ملزمة.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">2. مسؤولية الطبيب</h2>
          <p>
            تظل المسؤولية التشخيصية والعلاجية النهائية والكاملة على عاتق الطبيب المعالج المرخص له بمزاولة المهنة في الجمهورية اليمنية. يجب على الطبيب مراجعة كافة مخرجات النظام والتحقق منها بناءً على خبرته المهنية والفحص السريري المباشر للمريض.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">3. حدود المسؤولية</h2>
          <p>
            شركة "ريدان برو" (RaidanPro) ومطورو نظام "حكيم" غير مسؤولين عن أي أخطاء طبية، أو نتائج غير مرغوب فيها، أو أضرار مباشرة أو غير مباشرة تنتج عن استخدام النظام أو الاعتماد على مخرجاته دون مراجعة طبية بشرية دقيقة.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">4. الامتثال للقوانين اليمنية</h2>
          <p>
            تم تطوير هذا النظام مع مراعاة القوانين الصحية اليمنية وميثاق الشرف الطبي اليمني. يقر المستخدم (الطبيب) بالتزامه بكافة المعايير الأخلاقية والمهنية المنصوص عليها في التشريعات الوطنية عند استخدام هذه التقنية.
          </p>
        </section>
      </div>

      <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
        <Scale className="text-amber-600 w-5 h-5 mt-1" />
        <p className="text-xs text-amber-800 font-medium italic">
          باستخدامك لهذا النظام، فإنك تقر وتوافق على أن الذكاء الاصطناعي هو وسيلة مساعدة وليس بديلاً عن العقل البشري والخبرة الطبية المتراكمة.
        </p>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl border border-[#141414]/5 shadow-sm" dir="rtl">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <FileCheck className="text-emerald-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#141414]">سياسة الخصوصية وسيادة البيانات</h1>
          <p className="text-sm text-[#141414]/40">الالتزام بالسر الطبي وحماية بيانات المرضى</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-[#141414]/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">1. حماية البيانات الصحية (PHI)</h2>
          <p>
            نحن في "ريدان برو" ندرك قدسية البيانات الصحية. يتم معالجة بيانات المرضى محلياً على أجهزة العيادة أو عبر قنوات مشفرة بمعايير عالمية (AES-256) لضمان عدم وصول أي طرف غير مصرح له إليها.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">2. سيادة البيانات (Data Sovereignty)</h2>
          <p>
            يدعم نظام "حكيم" المعالجة المحلية (Edge Computing)، مما يعني أن البيانات الحساسة لا تغادر حدود العيادة أو الدولة إلا في حالات الضرورة القصوى وبموافقة الطبيب، مع الالتزام التام بمبدأ سيادة البيانات الوطنية.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">3. السر الطبي (Medical Confidentiality)</h2>
          <p>
            يلتزم النظام تقنياً بمبدأ "السر الطبي" المنصوص عليه في ميثاق الشرف الطبي اليمني. يتم تسجيل كافة عمليات الوصول إلى البيانات في سجلات تدقيق (Audit Logs) غير قابلة للتلاعب لضمان المساءلة والشفافية.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">4. حقوق المرضى</h2>
          <p>
            للمرضى الحق في معرفة كيفية استخدام بياناتهم في أنظمة الذكاء الاصطناعي. يجب على الطبيب الحصول على الموافقة المستنيرة من المريض عند استخدام النظام لتحليل بياناته الحساسة.
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-3xl border border-[#141414]/5 shadow-sm" dir="rtl">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <Scale className="text-indigo-600 w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#141414]">شروط الاستخدام</h1>
          <p className="text-sm text-[#141414]/40">اتفاقية الترخيص للمهنيين الصحيين</p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-[#141414]/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">1. الترخيص المهني</h2>
          <p>
            هذا البرنامج مرخص حصرياً للكوادر الطبية والمهنيين الصحيين المؤهلين والمرخصين. يمنع استخدام النظام من قبل الأفراد غير المتخصصين لأغراض التشخيص الذاتي.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">2. أمن الحسابات</h2>
          <p>
            يتحمل المستخدم المسؤولية الكاملة عن الحفاظ على سرية بيانات الدخول الخاصة به. يمنع منعاً باتاً مشاركة حسابات الوصول مع أطراف ثالثة أو استخدام النظام في بيئات غير آمنة تقنياً.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">3. الملكية الفكرية</h2>
          <p>
            كافة حقوق الملكية الفكرية لنظام "حكيم" والخوارزميات المرتبطة به تعود لشركة "ريدان برو" (RaidanPro). يمنع منعاً باتاً محاولة الهندسة العكسية، أو نسخ الأكواد، أو إعادة توزيع النظام دون إذن كتابي مسبق.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#141414] mb-3">4. إنهاء الخدمة</h2>
          <p>
            تحتفظ "ريدان برو" بالحق في تعليق أو إنهاء الوصول إلى النظام في حال ثبوت مخالفة شروط الاستخدام أو استخدامه بطريقة تضر بأخلاقيات المهنة الطبية أو أمن البيانات.
          </p>
        </section>
      </div>
    </div>
  );
}
