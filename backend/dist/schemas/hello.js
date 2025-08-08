"use strict";
// export const assignClassToCourse = async (req: Request, res: Response): Promise<void> => {
//   const { courseId } = req.params;
//   try {
//     const validationResult = assignClassesToCourseSchema.safeParse(req.body);
//     if (!validationResult.success) {
//       res.status(400).json({
//         message: 'Validation failed for class IDs',
//         errors: validationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message
//         }))
//       });
//       return;
//     }
//     const { classIds } = validationResult.data;
//     const course = await Course.findById(courseId);
//     if (!course) {
//       res.status(404).json({ message: 'Course not found.' });
//       return;
//     }
//     const newClassObjectIds = classIds.map(id => new Types.ObjectId(id));
//     // --- MODIFIED LINE AGAIN ---
//     // The most reliable way to handle the .lean() type inconsistency with _id
//     // is to first assert to `any` and then to the desired type.
//     const foundClasses = (await Class.find({ _id: { $in: newClassObjectIds } })
//                                    .select('_id')
//                                    .lean()) as any as ClassIdOnly[]; // <--- MODIFIED HERE
//     // --- END MODIFIED ---
//     const foundClassIds = new Set(foundClasses.map(c => c._id.toString()));
//     const validNewClassIdsToAdd: Types.ObjectId[] = [];
//     const notFoundClassIds: string[] = [];
//     const alreadyAssignedClassIds: string[] = [];
//     newClassObjectIds.forEach(id => {
//       if (!foundClassIds.has(id.toString())) {
//         notFoundClassIds.push(id.toString());
//       } else if (course.assignedClasses.includes(id)) {
//         alreadyAssignedClassIds.push(id.toString());
//       } else {
//         validNewClassIdsToAdd.push(id);
//       }
//     });
//     if (notFoundClassIds.length > 0) {
//       res.status(404).json({
//         message: 'Some classes were not found.',
//         notFoundClassIds: notFoundClassIds,
//       });
//       return;
//     }
//     if (validNewClassIdsToAdd.length === 0 && alreadyAssignedClassIds.length > 0) {
//         res.status(400).json({ message: 'All provided classes are already assigned to this course.' });
//         return;
//     } else if (validNewClassIdsToAdd.length === 0 && alreadyAssignedClassIds.length === 0) {
//         res.status(400).json({ message: 'No new valid classes provided to assign.' });
//         return;
//     }
//     course.assignedClasses.push(...validNewClassIdsToAdd);
//     await course.save();
//     const populatedCourse = await Course.findById(course._id)
//       .populate('mainCategory', '_id mainCategoryName')
//       .populate('category', '_id categoryName')
//       .populate('assignedClasses', '_id title teacherName');
//     let successMessage = 'Classes assigned successfully.';
//     if (alreadyAssignedClassIds.length > 0) {
//         successMessage += ` Some classes were already assigned and were skipped: ${alreadyAssignedClassIds.join(', ')}.`;
//     }
//     res.status(200).json({ message: successMessage, course: populatedCourse });
//   } catch (error: any) {
//     console.error('Error assigning classes to course:', error);
//     res.status(500).json({ message: error.message || 'Server Error' });
//   }
// };
// export const unassignClassFromCourse = async (req: Request, res: Response): Promise<void> => {
//   const { courseId } = req.params;
//   try {
//     // 1. Zod validation for the request body
//     const validationResult = unassignClassesFromCourseSchema.safeParse(req.body); // Use the new schema
//     if (!validationResult.success) {
//       res.status(400).json({
//         message: 'Validation failed for class IDs',
//         errors: validationResult.error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message
//         }))
//       });
//       return;
//     }
//     const { classIds } = validationResult.data;
//     // 2. Find the course
//     const course = await Course.findById(courseId);
//     if (!course) {
//       res.status(404).json({ message: 'Course not found.' });
//       return;
//     }
//     const classIdsToUnassign = new Set(classIds); // Convert to Set for efficient lookup
//     const initialAssignedClassesCount = course.assignedClasses.length;
//     const classesSuccessfullyUnassigned: string[] = [];
//     const classesNotFoundInCourse: string[] = [];
//     // Filter out the classes to unassign
//     course.assignedClasses = course.assignedClasses.filter(assignedClassId => {
//       if (classIdsToUnassign.has(assignedClassId.toString())) {
//         classesSuccessfullyUnassigned.push(assignedClassId.toString());
//         return false; // Remove this class
//       }
//       return true; // Keep this class
//     });
//     // Identify classes that were requested but not found in the course's assigned list
//     classIdsToUnassign.forEach(requestedId => {
//       if (!classesSuccessfullyUnassigned.includes(requestedId)) {
//         classesNotFoundInCourse.push(requestedId);
//       }
//     });
//     // 3. Check if any changes were made
//     if (initialAssignedClassesCount === course.assignedClasses.length && classesNotFoundInCourse.length === classIds.length) {
//       // No classes were removed, and all requested classes were not found in the course
//       res.status(400).json({ message: 'None of the provided classes were found in this course to unassign.' });
//       return;
//     }
//     await course.save();
//     // 4. Populate and return the updated course
//     const populatedCourse = await Course.findById(course._id)
//       .populate('mainCategory', '_id mainCategoryName')
//       .populate('category', '_id categoryName')
//       .populate('assignedClasses', '_id title teacherName'); // Populate class details
//     let successMessage = 'Classes unassigned successfully.';
//     if (classesNotFoundInCourse.length > 0) {
//         successMessage += ` Some classes were not found in the course's assigned list: ${classesNotFoundInCourse.join(', ')}.`;
//     }
//     res.status(200).json({ message: successMessage, course: populatedCourse });
//   } catch (error: any) {
//     console.error('Error unassigning classes from course:', error);
//     res.status(500).json({ message: error.message || 'Server Error' });
//   }
// };
// router.post('/:courseId/assign-class', assignClassToCourse);
// router.delete('/:courseId/unassign-class', unassignClassFromCourse);
// export const assignClassesToCourseSchema = z.object({
//   classIds: z.array(
//     z.string().refine(id => isValidObjectId(id), {
//       message: 'Each classId must be a valid MongoDB ObjectId',
//     })
//   ).min(1, 'At least one classId is required to assign classes.'), // <--- THIS LINE
// });
// export const unassignClassesFromCourseSchema = z.object({
//   classIds: z.array(
//     z.string().refine(id => isValidObjectId(id), {
//       message: 'Each classId must be a valid MongoDB ObjectId',
//     })
//   ).min(1, 'At least one classId is required to unassign classes.'), // <--- THIS LINE
// });
