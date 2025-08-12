import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { createQuestionSchema, getQuestionByIdBodySchema, updateQuestionSchema } from '../schemas/questionSchema';
import MainCategory from '../models/MainCategory';
import Category from '../models/Category';
import Section from '../models/Section';
import Topic from '../models/Topic';
import Question, { IQuestion } from '../models/Questions';

// Helper function to check if a referenced ID is valid and exists
const validateReference = async (
  model: any,
  id: string | Types.ObjectId | undefined,
  modelName: string,
  res: Response
): Promise<boolean> => {
  if (!id) return true;
  const idString = typeof id === 'string' ? id : id.toString();
  if (!Types.ObjectId.isValid(idString)) {
    res.status(400).json({ state: 400, message: `Invalid ${modelName} ID format provided.`, data: null });
    return false;
  }
  const exists = await model.findById(idString);
  if (!exists) {
    res.status(404).json({ state: 404, message: `${modelName} not found.`, data: null });
    return false;
  }
  return true;
};

// @desc    Create a new Question
// @route   POST /api/questions
// @access  Public
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    // Debug logging for troubleshooting
    console.log('=== Question Creation Debug Info ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Validate request body data
    const validationResult = createQuestionSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log('Validation errors:', validationResult.error.errors);
      res.status(400).json({
        state: 400,
        message: 'Validation failed for Question data',
        data: validationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    const questionDataFromRequest = validationResult.data;


    // Validate referenced entities exist
    if (!(await validateReference(MainCategory, questionDataFromRequest.mainCategory, 'Main Category', res))) return;
    if (!(await validateReference(Category, questionDataFromRequest.category, 'Category', res))) return;
    if (!(await validateReference(Section, questionDataFromRequest.sectionId, 'Section', res))) return;
    if (!(await validateReference(Topic, questionDataFromRequest.topicId, 'Topic', res))) return;

    // Prepare course data object
    const newQuestionDataObject: Partial<IQuestion> = {
      mainCategory: new Types.ObjectId(questionDataFromRequest.mainCategory),
      category: new Types.ObjectId(questionDataFromRequest.category),
          sectionId: new Types.ObjectId(questionDataFromRequest.sectionId),
          topicId: new Types.ObjectId(questionDataFromRequest.topicId),
          subTopicId: questionDataFromRequest.subTopicId ? new Types.ObjectId(questionDataFromRequest.subTopicId) : undefined,
      
          quesType: questionDataFromRequest.quesType,
          answerType: questionDataFromRequest.quesType,
          options: questionDataFromRequest.options || [],
          comprehension: questionDataFromRequest.comprehension ? new Map(Object.entries(questionDataFromRequest.comprehension)): undefined,
          question: questionDataFromRequest.question ? new Map(Object.entries(questionDataFromRequest.question)): undefined,
          questionImage: questionDataFromRequest.questionImage ? new Map(Object.entries(questionDataFromRequest.questionImage)): undefined,
          description: questionDataFromRequest.description ? new Map(Object.entries(questionDataFromRequest.description)): undefined,
          answer: questionDataFromRequest.answer ? new Map(Object.entries(questionDataFromRequest.answer)): undefined,
          solution: questionDataFromRequest.solution ? new Map(Object.entries(questionDataFromRequest.solution)): undefined,
          customerId: questionDataFromRequest.customerId,
          difficultyLevel: questionDataFromRequest.difficultyLevel,
          marks: questionDataFromRequest.marks,
          isVerified: questionDataFromRequest.isVerified,
          quesStatus: questionDataFromRequest.quesStatus,
          reviewerId: questionDataFromRequest.reviewerId ? new Types.ObjectId(questionDataFromRequest.reviewerId) : undefined,
          addedBy: questionDataFromRequest.addedBy ? new Types.ObjectId(questionDataFromRequest.addedBy) : undefined,
          verifiedBy: questionDataFromRequest.verifiedBy ? new Types.ObjectId(questionDataFromRequest.verifiedBy) : undefined,
          reviewedDate: questionDataFromRequest.reviewedDate ? new Date(questionDataFromRequest.reviewedDate) : undefined,
          parentQuestionId: questionDataFromRequest.parentQuestionId,
          compQuesId: questionDataFromRequest.compQuesId,
          questionView: questionDataFromRequest.questionView,
    };

    // Create and save the new Question
    const newQuestionDoc = new Question(newQuestionDataObject);
    const createdQuestion = await newQuestionDoc.save();

    // Populate related data for response
    const populatedQuestion = await Question.findById(createdQuestion.id)
      .populate('mainCategory', 'id mainCategoryName')
      .populate('category', 'id categoryName')
      .populate('sectionId', 'id sectionName')
      .populate('topicId', 'id topicName');

    res.status(201).json({
      state: 201,
      message: 'Question created successfully',
      data: populatedQuestion
    });

  } catch (error: any) {
    console.error('Error creating Question:', error);

    // Handle other errors
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error while creating Question',
      data: null
    });
  }
};

// @desc    Update a Question
// @route   PUT /api/question/:id
// @access  Public
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    // Debug logging for troubleshooting
    console.log('=== Question Update Debug Info ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const idValidationResult = getQuestionByIdBodySchema.safeParse(req.params);
    if (!idValidationResult.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid Question ID format in URL.',
        data: idValidationResult.error.errors,
      });
      return;
    }
    const questionId = idValidationResult.data.id;

    const bodyValidationResult = updateQuestionSchema.safeParse(req.body);
    if (!bodyValidationResult.success) {
      console.log('Update validation errors:', bodyValidationResult.error.errors);
      res.status(400).json({
        state: 400,
        message: 'Validation failed for update data',
        data: bodyValidationResult.error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })),
      });
      return;
    }

    const updatesFromBody = bodyValidationResult.data;
    const questionItem = await Question.findById(questionId);

    if (!questionItem) {
      res.status(404).json({ state: 404, message: 'Question not found', data: null });
      return;
    } 


    const finalUpdates: Partial<IQuestion> = { ...updatesFromBody } as Partial<IQuestion>;

    if (updatesFromBody.mainCategory && typeof updatesFromBody.mainCategory === 'string') {
      if (!(await validateReference(MainCategory, updatesFromBody.mainCategory, 'Main Category', res))) return;
      finalUpdates.mainCategory = new Types.ObjectId(updatesFromBody.mainCategory);
    } else if (updatesFromBody.mainCategory === null || updatesFromBody.mainCategory === undefined) {
      delete finalUpdates.mainCategory;
    }

    if (updatesFromBody.category && typeof updatesFromBody.category === 'string') {
      if (!(await validateReference(Category, updatesFromBody.category, 'Category', res))) return;
      finalUpdates.category = new Types.ObjectId(updatesFromBody.category);
    } else if (updatesFromBody.category === null || updatesFromBody.category === undefined) {
      delete finalUpdates.category;
    }

    Object.assign(questionItem, finalUpdates);
    const updatedQuestionDoc = await questionItem.save();

    const populatedQuestion = await Question.findById(updatedQuestionDoc.id)
      .populate('mainCategory', 'id mainCategoryName')
      .populate('category', 'id categoryName')
      .populate('section', 'id sectionName')
      .populate('topic', 'id topicName');

    res.status(200).json({
      state: 200,
      message: 'Question updated successfully',
      data: populatedQuestion
    });
  } catch (error: any) {
    console.error('Error updating Question:', error);

    // Handle other errors
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error while updating Question',
      data: null
    });
  }
};

// @desc    Get all Questions
// @route   GET /api/questions
// @access  Public
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const coursesAggregation = await Question.aggregate([
      { $match: {} } // Matches all documents
    ]);
    res.status(200).json({
      state: 200,
      message: coursesAggregation.length > 0 ? 'Question retrieved successfully' : 'No data found',
      data: coursesAggregation,
    });
  } catch (error: any) {
    console.error('Error fetching Questions:', error);
    res.status(500).json({
      state: 500,
      message: error.message || 'Server Error',
      data: [],
    });
  }
};

// @desc    Get a single Question by ID
// @route   GET /api/questions/:id
// @access  Public
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = getQuestionByIdBodySchema.safeParse(req.params);
    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid Question ID format.',
        data: validationResult.error.errors.map(err => ({ path: err.path.join('.'), message: err.message })),
      });
      return;
    }
    const { id: questionIdParam } = validationResult.data;
    const courseResultAggregation = await Question.aggregate([
      { $match: { _id: new Types.ObjectId(questionIdParam) } }
    ]);

    const questionItem = courseResultAggregation[0];

    if (questionItem) {
      res.status(200).json({
        state: 200,
        message: 'Question retrieved successfully',
        data: questionItem,
      });
    } else {
      res.status(404).json({ state: 404, message: 'Question not found', data: null });
    }
  } catch (error: any) {
    console.error('Error fetching Question by ID:', error);
    res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
  }
};

// @desc    Delete a Question
// @route   DELETE /api/questions/:id
// @access  Public
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = getQuestionByIdBodySchema.safeParse(req.params);
    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid Question ID format.',
        data: validationResult.error.errors,
      });
      return;
    }

    const { id } = validationResult.data;
    await Question.deleteOne({ _id: id });
  } catch (error: any) {
    console.error('Error deleting Question:', error);
    res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
  }
};


// @desc    Update Question status
// @route   PATCH /api/questions/:id/status
// @access  Public
export const updateQuestionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = getQuestionByIdBodySchema.safeParse(req.params);
    if (!validationResult.success) {
      res.status(400).json({
        state: 400,
        message: 'Invalid Question ID format.',
        data: validationResult.error.errors,
      });
      return;
    }
    const questionId = validationResult.data.id;

    const questionToUpdate = await Question.findById(questionId);

    if (!questionToUpdate) {
      res.status(404).json({ state: 404, message: 'Question not found.', data: null });
      return;
    }

    questionToUpdate.status = questionToUpdate.status === 'active' ? 'inactive' : 'active';
    const updatedQuestion = await questionToUpdate.save();

    res.status(200).json({
      state: 200,
      message: 'Question status toggled successfully',
      data: updatedQuestion,
    });

  } catch (error: any) {
    console.error('Error toggling Question status:', error);
    res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
  }
};