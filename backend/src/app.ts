import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import mainCategoryRoutes from './routes/mainCategoryRoutes';
import categoryRoutes from './routes/categoryRoutes';
import sectionRoutes from './routes/sectionRoutes';
import topicRoutes from './routes/topicRoutes';
import classRoutes from './routes/classRoutes';
import pdfRoutes from './routes/pdfRoutes';
import courseRoutes from './routes/courseRoutes'
import coursePdfRoutes from './routes/coursePdfRoutes';
import courseClassRoutes from './routes/courseClassRoutes';
import teacherRoutes from './routes/teacherRoutes';
// import orderRoutes from './routes/orderRoutes';
import classProgressRoutes from './routes/classProgressRoutes';
import courseProgressRoutes from './routes/courseProgressRoutes';
import testResultRoutes from './routes/testResultRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import viewRoutes from './routes/viewRoutes';
import bannerRoutes from './routes/bannerRoutes';
import rankScoreRoutes from './routes/rankScoreRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import bookRoutes from './routes/booksRoutes';
import ebooksRoutes from './routes/ebooksRoutes';
import authRoutes from './routes/authRoutes'; 
import contactRoutes from './routes/contactRoutes';
import notificationRoutes from './routes/notification.routes';
import addressRoutes from './routes/address.routes'
import orderRoutes from './routes/order.routes-books'
import uploadRoutes from './routes/uploadRoutes';
import bannerV2Routes from './routes/bannerV2Routes';
import couponRoutes from './routes/couponRoutes'; 
import subscriptionRoutes from './routes/subscription.routes';
import seoUrlRoutes from './routes/seoUrl.routes';
import subTopicRoutes from './routes/subTopic.routes'; 
import questionRoutes from './routes/questionRoutes';
import instructionRoutes from './routes/instruction.routes'


import { Request, Response, NextFunction } from 'express';

dotenv.config();

const app = express();

// Increase server timeout for large file uploads
app.use((req, res, next) => {
  // Set timeout to 10 minutes for large file uploads
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
});

// Connect Database
connectDB();

// Middleware
// Configure body parser with increased size limits
app.use(express.json({
  limit: '500mb',
  verify: (req, res, buf) => {
    // Optional: Add request size logging
    if (buf.length > 100 * 1024 * 1024) { // Log requests larger than 100MB
      console.log(`📊 Large request received: ${(buf.length / 1024 / 1024).toFixed(2)}MB`);
    }
  }
})); // Increase JSON payload limit to 500MB
app.use(express.urlencoded({
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

app.use(cors());
// app.use((req, res, next) => {
//   console.log(`[SERVER LOG] Incoming Request: ${req.method} ${req.originalUrl}`);
//   next();
// });

// Routes
app.use('/api/main-categories', mainCategoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/classes', classRoutes);
// app.use('/api/pdfs', pdfRoutes);
app.use('/api/pdfs', (req, res, next) => {
  console.log('--- A request hit /api/pdfs ---');
  console.log('Method:', req.method);
  console.log('Content-Type Header:', req.headers['content-type']);
  next(); // Pass control to the pdfRoutes
}, pdfRoutes);
app.use('/api', courseClassRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', coursePdfRoutes); // Course-PDF assignment routes
app.use('/api/teachers', teacherRoutes);
app.use('/api/upload', uploadRoutes)
app.use('/api/orders', orderRoutes);
app.use('/api/class-progress', classProgressRoutes);
app.use('/api/course-progress', courseProgressRoutes);
app.use('/api/test-results', testResultRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/rank-scores', rankScoreRoutes);
app.use('/api/books', bookRoutes)
app.use('/api/ebooks', ebooksRoutes)
app.use('/api/auth', authRoutes);
app.use('/api', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/v2/banners', bannerV2Routes)
app.use('/api/coupons', couponRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/seourls', seoUrlRoutes);
app.use('/api/sub-topics', subTopicRoutes); 
app.use('/api/instructions', instructionRoutes); 
app.use('/api/questions', questionRoutes);




app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5099;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
