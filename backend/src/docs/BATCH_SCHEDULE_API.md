# Batch Schedule API Documentation

## Overview
The Batch Schedule API allows you to retrieve all scheduled classes between a given start and end date, with optional status filtering.

## Endpoint
```
GET /api/schedules/batch
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | string | ✅ Yes | - | Start date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ) |
| `endDate` | string | ✅ Yes | - | End date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ) |
| `status` | string | ❌ No | `active` | Filter by status: `active`, `cancelled`, or `all` |

## Date Range Logic
The API returns schedules that:
- **Start within** the date range, OR
- **End within** the date range, OR  
- **Span across** the entire date range

This ensures no overlapping schedules are missed.

## Response Format

### Success Response (200)
```json
{
  "state": 200,
  "message": "Found X schedule(s) between YYYY-MM-DD and YYYY-MM-DD",
  "data": {
    "dateRange": {
      "startDate": "2024-06-07T00:00:00.000Z",
      "endDate": "2024-06-10T00:00:00.000Z"
    },
    "totalSchedules": 4,
    "totalDays": 3,
    "schedulesByDate": [
      {
        "date": "2024-06-07",
        "schedules": [
          {
            "id": "schedule_id",
            "startDate": "2024-06-07T09:00:00.000Z",
            "endDate": "2024-06-07T10:30:00.000Z",
            "status": "active",
            "course": {
              "id": "course_id",
              "title": "Course Title",
              "mainCategory": { "id": "cat_id", "mainCategoryName": "Category" }
            },
            "class": {
              "id": "class_id",
              "title": "Class Title",
              "teacherName": "Teacher Name",
              "section": { "id": "section_id", "sectionName": "Section" },
              "topic": { "id": "topic_id", "topicName": "Topic" }
            }
          }
        ]
      }
    ],
    "flatSchedules": [
      // Same schedule objects in a flat array
    ]
  }
}
```

### Error Responses

#### Missing Parameters (400)
```json
{
  "state": 400,
  "message": "Both startDate and endDate are required",
  "data": null
}
```

#### Invalid Date Format (400)
```json
{
  "state": 400,
  "message": "Invalid date format. Use ISO date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)",
  "data": null
}
```

#### Invalid Date Range (400)
```json
{
  "state": 400,
  "message": "End date must be after start date",
  "data": null
}
```

## Usage Examples

### Get all active schedules for a week
```
GET /api/schedules/batch?startDate=2024-06-07&endDate=2024-06-14
```

### Get all schedules (including cancelled) for a month
```
GET /api/schedules/batch?startDate=2024-06-01&endDate=2024-06-30&status=all
```

### Get only cancelled schedules for a specific day
```
GET /api/schedules/batch?startDate=2024-06-07&endDate=2024-06-07&status=cancelled
```

## Features

✅ **Date Range Filtering**: Flexible date range with multiple overlap scenarios  
✅ **Status Filtering**: Filter by active, cancelled, or all schedules  
✅ **Rich Population**: Includes full course and class details with categories  
✅ **Dual Response Format**: Both grouped by date and flat array for flexibility  
✅ **Input Validation**: Comprehensive validation with descriptive error messages  
✅ **Sorting**: Schedules sorted by date and time within each day  

## Related APIs

- `POST /api/schedules` - Create a new schedule
- `GET /api/courses/:courseId/classes` - Get classes for a course
- `GET /api/classes/live/course/:courseId` - Get currently live classes

## Notes

- All timestamps are in UTC format
- The API supports both date-only (YYYY-MM-DD) and full ISO datetime formats
- Populated course and class data includes categories, sections, and topics for comprehensive information
- The `schedulesByDate` format is ideal for calendar views
- The `flatSchedules` format is ideal for list views or further processing
