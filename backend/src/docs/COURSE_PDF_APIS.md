# Course-PDF Assignment APIs

This document describes the newly created APIs for assigning PDFs to courses, similar to how classes are assigned to courses.

## 📋 Overview

The system now supports:
- Assigning PDFs to courses with priority ordering
- Getting all PDFs for a specific course
- Getting all courses that contain a specific PDF
- Reordering PDF priorities within a course
- Toggling PDF status (active/inactive)
- Removing PDF assignments

## 🗂️ Database Structure

### CoursePdf Junction Model
- **course**: Reference to Course ID
- **pdf**: Reference to PDF ID
- **priority**: Integer (1+) for ordering PDFs within a course
- **isActive**: Boolean to enable/disable assignments
- **addedAt**: Timestamp when PDF was assigned
- **createdAt/updatedAt**: Auto-generated timestamps

## 🚀 API Endpoints

### 1. Assign PDF to Course
```http
POST /api/courses/:courseId/pdfs
Content-Type: application/json

{
  "pdfId": "60c72b1f9b1e8e001c8f4b13",
  "priority": 1  // Optional - auto-assigned if not provided
}
```

**Response:**
```json
{
  "state": 201,
  "msg": "PDF assigned to course successfully",
  "data": {
    "_id": "...",
    "course": { "_id": "...", "title": "Course Title" },
    "pdf": {
      "_id": "...",
      "title": "PDF Title",
      "description": "PDF Description",
      "mainCategory": { "_id": "...", "mainCategoryName": "..." },
      "category": { "_id": "...", "categoryName": "..." }
    },
    "priority": 1,
    "isActive": true,
    "addedAt": "2023-07-15T14:30:00.000Z"
  }
}
```

### 2. Get PDFs for Course
```http
GET /api/courses/:courseId/pdfs?page=1&limit=20&sortBy=priority&includeInactive=false
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: 'priority' or 'recent' (default: 'priority')
- `includeInactive`: Include inactive assignments (default: false)

**Response:**
```json
{
  "state": 200,
  "msg": "PDFs retrieved successfully",
  "data": {
    "pdfs": [
      {
        "_id": "...",
        "priority": 1,
        "isActive": true,
        "pdf": {
          "_id": "...",
          "title": "PDF Title",
          "uploadPdf": "https://s3.amazonaws.com/...",
          "mainCategory": { "_id": "...", "mainCategoryName": "..." }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 45,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Courses for PDF
```http
GET /api/pdfs/:pdfId/courses?includeInactive=false
```

**Response:**
```json
{
  "state": 200,
  "msg": "Courses retrieved successfully",
  "data": [
    {
      "_id": "...",
      "priority": 1,
      "isActive": true,
      "course": {
        "_id": "...",
        "title": "Course Title",
        "description": "Course Description"
      }
    }
  ]
}
```

### 4. Update PDF Priority
```http
PUT /api/courses/:courseId/pdfs/:pdfId/priority
Content-Type: application/json

{
  "priority": 3
}
```

### 5. Reorder PDFs in Course
```http
PUT /api/courses/:courseId/pdfs/reorder
Content-Type: application/json

{
  "pdfOrder": [
    { "pdfId": "60c72b1f9b1e8e001c8f4b13", "priority": 1 },
    { "pdfId": "60c72b1f9b1e8e001c8f4b14", "priority": 2 },
    { "pdfId": "60c72b1f9b1e8e001c8f4b15", "priority": 3 }
  ]
}
```

### 6. Toggle PDF Status
```http
PATCH /api/courses/:courseId/pdfs/:pdfId/toggle-status
```

**Response:**
```json
{
  "state": 200,
  "msg": "PDF status toggled successfully",
  "data": {
    "_id": "...",
    "isActive": false,
    "updatedAt": "2023-07-15T14:35:00.000Z"
  }
}
```

### 7. Remove PDF from Course
```http
DELETE /api/courses/:courseId/pdfs/:pdfId
```

## 🎯 Usage Examples

### Frontend Implementation Example (JavaScript)

```javascript
// Assign PDF to course
async function assignPdfToCourse(courseId, pdfId, priority) {
  const response = await fetch(`/api/courses/${courseId}/pdfs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfId, priority })
  });
  return response.json();
}

// Get PDFs for course with pagination
async function getCoursePdfs(courseId, page = 1, limit = 20) {
  const response = await fetch(
    `/api/courses/${courseId}/pdfs?page=${page}&limit=${limit}`
  );
  return response.json();
}

// Reorder PDFs (drag-and-drop implementation)
async function reorderPdfs(courseId, newOrder) {
  const pdfOrder = newOrder.map((item, index) => ({
    pdfId: item.id,
    priority: index + 1
  }));
  
  const response = await fetch(`/api/courses/${courseId}/pdfs/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pdfOrder })
  });
  return response.json();
}
```

## 🔧 Static Methods Available

The CoursePdf model includes these built-in static methods:

1. **getPdfsForCourse()**: Get PDFs with pagination and population
2. **getCoursesForPdf()**: Find all courses containing a PDF
3. **reorderPriorities()**: Bulk update priorities with transaction safety

## ✨ Features

- **Automatic Priority Management**: Prevents conflicts and auto-assigns next available priority
- **Transaction Safety**: Bulk operations use MongoDB transactions
- **Pagination Support**: Built-in pagination for large datasets
- **Full Population**: Automatically populates related data (categories, sections, etc.)
- **Validation**: Comprehensive input validation with Zod schemas
- **Error Handling**: Detailed error messages and proper HTTP status codes

## 🔒 Data Integrity

- **Unique Constraints**: Prevents duplicate PDF-course assignments
- **Reference Validation**: Ensures course and PDF exist before assignment
- **Cascading Updates**: Priority conflicts are automatically resolved
- **Index Optimization**: Compound indexes for efficient queries

This implementation provides a robust, scalable solution for managing PDF-course relationships with the same level of functionality as the existing class-course system.
