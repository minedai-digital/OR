// ملف: assets/js/auth.js

// إنشاء اتصال بـ Supabase
let supabaseClient = null;
if (SUPABASE_CONFIG.url !== 'https://your-project.supabase.co' && SUPABASE_CONFIG.anonKey !== 'your-anon-key') {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

const AuthManager = {
    /**
     * تسجيل الدخول
     * @param {string} username
     * @param {string} password
     * @returns {object} { success: boolean, message: string }
     */
    login: async function (username, password) {
        try {
            // إذا ما فيش إعدادات Supabase → نشتغل على الوضع التجريبي
            if (!supabaseClient) {
                if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
                    sessionStorage.setItem("loggedInUser", username);
                    return { success: true, message: "تم تسجيل الدخول بنجاح (وضع تجريبي)" };
                } else {
                    return { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" };
                }
            }

            // الوضع الفعلي → Supabase
            const { data, error } = await supabaseClient
                .from("users") // اسم الجدول في قاعدة البيانات
                .select("*")
                .eq("username", username)
                .eq("password", password) // ⚠ في الواقع، يفضل تخزين كلمة المرور مشفرة
                .single();

            if (error) {
                console.error(error);
                return { success: false, message: "حدث خطأ أثناء الاتصال بقاعدة البيانات" };
            }

            if (data) {
                sessionStorage.setItem("loggedInUser", username);
                return { success: true, message: "تم تسجيل الدخول بنجاح" };
            } else {
                return { success: false, message: "بيانات الدخول غير صحيحة" };
            }

        } catch (err) {
            console.error(err);
            return { success: false, message: "حدث خطأ غير متوقع" };
        }
    },

    /**
     * تسجيل الخروج
     */
    logout: function () {
        sessionStorage.removeItem("loggedInUser");
        window.location.href = "index.html"; // رجوع لصفحة تسجيل الدخول
    },

    /**
     * التحقق من حالة تسجيل الدخول
     */
    isAuthenticated: function () {
        return !!sessionStorage.getItem("loggedInUser");
    }
};

// جعل AuthManager متاح عالميًا
window.AuthManager = AuthManager;
