// ملف: assets/js/auth.js

// إنشاء اتصال بـ Supabase
let supabaseClient = null;
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'https://your-project.supabase.co' && 
    SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey !== 'your-anon-key') {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (error) {
        console.error('خطأ في إنشاء اتصال Supabase:', error);
    }
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
            // التحقق من صحة المدخلات
            if (!username || !password) {
                return { success: false, message: "يرجى إدخال اسم المستخدم وكلمة المرور" };
            }
            
            // إذا ما فيش إعدادات Supabase → نشتغل على الوضع التجريبي
            if (!supabaseClient) {
                if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
                    // تخزين معلومات المستخدم في الجلسة
                    const userData = {
                        username: username,
                        loginTime: new Date().toISOString(),
                        role: 'admin'
                    };
                    sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
                    return { success: true, message: "تم تسجيل الدخول بنجاح (وضع تجريبي)" };
                } else {
                    return { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" };
                }
            }

            // الوضع الفعلي → Supabase
            const { data, error } = await supabaseClient
                .from("users") // اسم الجدول في قاعدة البيانات
                .select("id, username, role")
                .eq("username", username)
                .eq("password", password) // ⚠ في الواقع، يفضل تخزين كلمة المرور مشفرة
                .single();

            if (error) {
                console.error(error);
                return { success: false, message: "حدث خطأ أثناء الاتصال بقاعدة البيانات" };
            }

            if (data) {
                // تخزين معلومات المستخدم في الجلسة
                const userData = {
                    id: data.id,
                    username: data.username,
                    role: data.role || 'user',
                    loginTime: new Date().toISOString()
                };
                sessionStorage.setItem("loggedInUser", JSON.stringify(userData));
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
        const userData = sessionStorage.getItem("loggedInUser");
        if (!userData) return false;
        
        // في الوضع التجريبي، التحقق من صلاحية الجلسة (مثلاً لمدة 24 ساعة)
        try {
            const user = JSON.parse(userData);
            if (user.loginTime) {
                const loginTime = new Date(user.loginTime);
                const currentTime = new Date();
                const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
                
                // إذا تجاوزت مدة الجلسة 24 ساعة، سجل الخروج
                if (hoursDiff > 24) {
                    this.logout();
                    return false;
                }
            }
            return true;
        } catch (e) {
            console.error("خطأ في تحليل بيانات المستخدم:", e);
            return false;
        }
    },
    
    /**
     * الحصول على معلومات المستخدم المسجل دخوله
     */
    getCurrentUser: function () {
        try {
            const userData = sessionStorage.getItem("loggedInUser");
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error("خطأ في تحليل بيانات المستخدم:", e);
            return null;
        }
    }
};

// جعل AuthManager متاح عالميًا
window.AuthManager = AuthManager;
