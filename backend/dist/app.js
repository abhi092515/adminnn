"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const mainCategoryRoutes_1 = __importDefault(require("./routes/mainCategoryRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const sectionRoutes_1 = __importDefault(require("./routes/sectionRoutes"));
const topicRoutes_1 = __importDefault(require("./routes/topicRoutes"));
const classRoutes_1 = __importDefault(require("./routes/classRoutes"));
const pdfRoutes_1 = __importDefault(require("./routes/pdfRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const coursePdfRoutes_1 = __importDefault(require("./routes/coursePdfRoutes"));
const courseClassRoutes_1 = __importDefault(require("./routes/courseClassRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
// import orderRoutes from './routes/orderRoutes';
const classProgressRoutes_1 = __importDefault(require("./routes/classProgressRoutes"));
const courseProgressRoutes_1 = __importDefault(require("./routes/courseProgressRoutes"));
const testResultRoutes_1 = __importDefault(require("./routes/testResultRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const viewRoutes_1 = __importDefault(require("./routes/viewRoutes"));
const bannerRoutes_1 = __importDefault(require("./routes/bannerRoutes"));
const rankScoreRoutes_1 = __importDefault(require("./routes/rankScoreRoutes"));
const booksRoutes_1 = __importDefault(require("./routes/booksRoutes"));
const ebooksRoutes_1 = __importDefault(require("./routes/ebooksRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const address_routes_1 = __importDefault(require("./routes/address.routes"));
const order_routes_books_1 = __importDefault(require("./routes/order.routes-books"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const bannerV2Routes_1 = __importDefault(require("./routes/bannerV2Routes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const seoUrl_routes_1 = __importDefault(require("./routes/seoUrl.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Increase server timeout for large file uploads
app.use((req, res, next) => {
    // Set timeout to 10 minutes for large file uploads
    req.setTimeout(600000); // 10 minutes
    res.setTimeout(600000); // 10 minutes
    next();
});
// Connect Database
(0, db_1.default)();
// Middleware
// Configure body parser with increased size limits
app.use(express_1.default.json({
    limit: '500mb',
    verify: (req, res, buf) => {
        // Optional: Add request size logging
        if (buf.length > 100 * 1024 * 1024) { // Log requests larger than 100MB
            console.log(`📊 Large request received: ${(buf.length / 1024 / 1024).toFixed(2)}MB`);
        }
    }
})); // Increase JSON payload limit to 500MB
app.use(express_1.default.urlencoded({
    limit: '500mb',
    extended: true,
    parameterLimit: 100000
})); // Increase URL-encoded payload limit to 500MB
// Add headers for better large request handling
app.use((req, res, next) => {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Range', 'bytes');
    next();
});
app.use((0, cors_1.default)());
// app.use((req, res, next) => {
//   console.log(`[SERVER LOG] Incoming Request: ${req.method} ${req.originalUrl}`);
//   next();
// });
// Routes
app.use('/api/main-categories', mainCategoryRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/sections', sectionRoutes_1.default);
app.use('/api/topics', topicRoutes_1.default);
app.use('/api/classes', classRoutes_1.default);
// app.use('/api/pdfs', pdfRoutes);
app.use('/api/pdfs', (req, res, next) => {
    console.log('--- A request hit /api/pdfs ---');
    console.log('Method:', req.method);
    console.log('Content-Type Header:', req.headers['content-type']);
    next(); // Pass control to the pdfRoutes
}, pdfRoutes_1.default);
app.use('/api', courseClassRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api', coursePdfRoutes_1.default); // Course-PDF assignment routes
app.use('/api/teachers', teacherRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/orders', order_routes_books_1.default);
app.use('/api/class-progress', classProgressRoutes_1.default);
app.use('/api/course-progress', courseProgressRoutes_1.default);
app.use('/api/test-results', testResultRoutes_1.default);
app.use('/api/schedules', scheduleRoutes_1.default);
app.use('/api/views', viewRoutes_1.default);
app.use('/api/banners', bannerRoutes_1.default);
app.use('/api/rank-scores', rankScoreRoutes_1.default);
app.use('/api/books', booksRoutes_1.default);
app.use('/api/ebooks', ebooksRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api', contactRoutes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/addresses', address_routes_1.default);
app.use('/api/order', order_routes_books_1.default);
app.use('/api/v2/banners', bannerV2Routes_1.default);
app.use('/api/coupons', couponRoutes_1.default);
app.use('/api/subscriptions', subscription_routes_1.default);
app.use('/api/seourls', seoUrl_routes_1.default);
app.get('/', (req, res) => {
    res.send('API is running...');
});
const PORT = process.env.PORT || 5099;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
