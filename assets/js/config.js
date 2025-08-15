// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co', // Replace with your Supabase URL
    anonKey: 'your-anon-key' // Replace with your Supabase anon key
};

// Application Configuration
const APP_CONFIG = {
    name: 'نظام إدارة العمليات',
    version: '1.0.0',
    defaultLanguage: 'ar',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [10, 25, 50, 100]
    }
};

// Default credentials for demo (in production, use proper authentication)
const DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Export configuration
window.APP_CONFIG = APP_CONFIG;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.DEMO_CREDENTIALS = DEMO_CREDENTIALS;