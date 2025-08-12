"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionStatus = exports.deleteQuestion = exports.getQuestionById = exports.getQuestions = exports.updateQuestion = exports.createQuestion = void 0;
const mongoose_1 = require("mongoose");
const questionSchema_1 = require("../schemas/questionSchema");
const MainCategory_1 = __importDefault(require("../models/MainCategory"));
const Category_1 = __importDefault(require("../models/Category"));
const Section_1 = __importDefault(require("../models/Section"));
const Topic_1 = __importDefault(require("../models/Topic"));
const Questions_1 = __importDefault(require("../models/Questions"));
// Helper function to check if a referenced ID is valid and exists
const validateReference = (model, id, modelName, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id)
        return true;
    const idString = typeof id === 'string' ? id : id.toString();
    if (!mongoose_1.Types.ObjectId.isValid(idString)) {
        res.status(400).json({ state: 400, message: `Invalid ${modelName} ID format provided.`, data: null });
        return false;
    }
    const exists = yield model.findById(idString);
    if (!exists) {
        res.status(404).json({ state: 404, message: `${modelName} not found.`, data: null });
        return false;
    }
    return true;
});
// @desc    Create a new Question
// @route   POST /api/questions
// @access  Public
const createQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Debug logging for troubleshooting
        console.log('=== Question Creation Debug Info ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        // Validate request body data
        const validationResult = questionSchema_1.createQuestionSchema.safeParse(req.body);
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
        if (!(yield validateReference(MainCategory_1.default, questionDataFromRequest.mainCategory, 'Main Category', res)))
            return;
        if (!(yield validateReference(Category_1.default, questionDataFromRequest.category, 'Category', res)))
            return;
        if (!(yield validateReference(Section_1.default, questionDataFromRequest.sectionId, 'Section', res)))
            return;
        if (!(yield validateReference(Topic_1.default, questionDataFromRequest.topicId, 'Topic', res)))
            return;
        // Prepare course data object
        const newQuestionDataObject = {
            mainCategory: new mongoose_1.Types.ObjectId(questionDataFromRequest.mainCategory),
            category: new mongoose_1.Types.ObjectId(questionDataFromRequest.category),
            sectionId: new mongoose_1.Types.ObjectId(questionDataFromRequest.sectionId),
            topicId: new mongoose_1.Types.ObjectId(questionDataFromRequest.topicId),
            subTopicId: questionDataFromRequest.subTopicId ? new mongoose_1.Types.ObjectId(questionDataFromRequest.subTopicId) : undefined,
            quesType: questionDataFromRequest.quesType,
            answerType: questionDataFromRequest.quesType,
            options: questionDataFromRequest.options || [],
            comprehension: questionDataFromRequest.comprehension ? new Map(Object.entries(questionDataFromRequest.comprehension)) : undefined,
            question: questionDataFromRequest.question ? new Map(Object.entries(questionDataFromRequest.question)) : undefined,
            questionImage: questionDataFromRequest.questionImage ? new Map(Object.entries(questionDataFromRequest.questionImage)) : undefined,
            description: questionDataFromRequest.description ? new Map(Object.entries(questionDataFromRequest.description)) : undefined,
            answer: questionDataFromRequest.answer ? new Map(Object.entries(questionDataFromRequest.answer)) : undefined,
            solution: questionDataFromRequest.solution ? new Map(Object.entries(questionDataFromRequest.solution)) : undefined,
            customerId: questionDataFromRequest.customerId,
            difficultyLevel: questionDataFromRequest.difficultyLevel,
            marks: questionDataFromRequest.marks,
            isVerified: questionDataFromRequest.isVerified,
            quesStatus: questionDataFromRequest.quesStatus,
            reviewerId: questionDataFromRequest.reviewerId ? new mongoose_1.Types.ObjectId(questionDataFromRequest.reviewerId) : undefined,
            addedBy: questionDataFromRequest.addedBy ? new mongoose_1.Types.ObjectId(questionDataFromRequest.addedBy) : undefined,
            verifiedBy: questionDataFromRequest.verifiedBy ? new mongoose_1.Types.ObjectId(questionDataFromRequest.verifiedBy) : undefined,
            reviewedDate: questionDataFromRequest.reviewedDate ? new Date(questionDataFromRequest.reviewedDate) : undefined,
            parentQuestionId: questionDataFromRequest.parentQuestionId,
            compQuesId: questionDataFromRequest.compQuesId,
            questionView: questionDataFromRequest.questionView,
        };
        // Create and save the new Question
        const newQuestionDoc = new Questions_1.default(newQuestionDataObject);
        const createdQuestion = yield newQuestionDoc.save();
        // Populate related data for response
        const populatedQuestion = yield Questions_1.default.findById(createdQuestion.id)
            .populate('mainCategory', 'id mainCategoryName')
            .populate('category', 'id categoryName')
            .populate('sectionId', 'id sectionName')
            .populate('topicId', 'id topicName');
        res.status(201).json({
            state: 201,
            message: 'Question created successfully',
            data: populatedQuestion
        });
    }
    catch (error) {
        console.error('Error creating Question:', error);
        // Handle other errors
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error while creating Question',
            data: null
        });
    }
});
exports.createQuestion = createQuestion;
// @desc    Update a Question
// @route   PUT /api/question/:id
// @access  Public
const updateQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Debug logging for troubleshooting
        console.log('=== Question Update Debug Info ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        const idValidationResult = questionSchema_1.getQuestionByIdBodySchema.safeParse(req.params);
        if (!idValidationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Question ID format in URL.',
                data: idValidationResult.error.errors,
            });
            return;
        }
        const questionId = idValidationResult.data.id;
        const bodyValidationResult = questionSchema_1.updateQuestionSchema.safeParse(req.body);
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
        const questionItem = yield Questions_1.default.findById(questionId);
        if (!questionItem) {
            res.status(404).json({ state: 404, message: 'Question not found', data: null });
            return;
        }
        const finalUpdates = Object.assign({}, updatesFromBody);
        if (updatesFromBody.mainCategory && typeof updatesFromBody.mainCategory === 'string') {
            if (!(yield validateReference(MainCategory_1.default, updatesFromBody.mainCategory, 'Main Category', res)))
                return;
            finalUpdates.mainCategory = new mongoose_1.Types.ObjectId(updatesFromBody.mainCategory);
        }
        else if (updatesFromBody.mainCategory === null || updatesFromBody.mainCategory === undefined) {
            delete finalUpdates.mainCategory;
        }
        if (updatesFromBody.category && typeof updatesFromBody.category === 'string') {
            if (!(yield validateReference(Category_1.default, updatesFromBody.category, 'Category', res)))
                return;
            finalUpdates.category = new mongoose_1.Types.ObjectId(updatesFromBody.category);
        }
        else if (updatesFromBody.category === null || updatesFromBody.category === undefined) {
            delete finalUpdates.category;
        }
        Object.assign(questionItem, finalUpdates);
        const updatedQuestionDoc = yield questionItem.save();
        const populatedQuestion = yield Questions_1.default.findById(updatedQuestionDoc.id)
            .populate('mainCategory', 'id mainCategoryName')
            .populate('category', 'id categoryName')
            .populate('section', 'id sectionName')
            .populate('topic', 'id topicName');
        res.status(200).json({
            state: 200,
            message: 'Question updated successfully',
            data: populatedQuestion
        });
    }
    catch (error) {
        console.error('Error updating Question:', error);
        // Handle other errors
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error while updating Question',
            data: null
        });
    }
});
exports.updateQuestion = updateQuestion;
// @desc    Get all Questions
// @route   GET /api/questions
// @access  Public
const getQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coursesAggregation = yield Questions_1.default.aggregate([
            { $match: {} } // Matches all documents
        ]);
        res.status(200).json({
            state: 200,
            message: coursesAggregation.length > 0 ? 'Question retrieved successfully' : 'No data found',
            data: coursesAggregation,
        });
    }
    catch (error) {
        console.error('Error fetching Questions:', error);
        res.status(500).json({
            state: 500,
            message: error.message || 'Server Error',
            data: [],
        });
    }
});
exports.getQuestions = getQuestions;
// @desc    Get a single Question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = questionSchema_1.getQuestionByIdBodySchema.safeParse(req.params);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Question ID format.',
                data: validationResult.error.errors.map(err => ({ path: err.path.join('.'), message: err.message })),
            });
            return;
        }
        const { id: questionIdParam } = validationResult.data;
        const courseResultAggregation = yield Questions_1.default.aggregate([
            { $match: { _id: new mongoose_1.Types.ObjectId(questionIdParam) } }
        ]);
        const questionItem = courseResultAggregation[0];
        if (questionItem) {
            res.status(200).json({
                state: 200,
                message: 'Question retrieved successfully',
                data: questionItem,
            });
        }
        else {
            res.status(404).json({ state: 404, message: 'Question not found', data: null });
        }
    }
    catch (error) {
        console.error('Error fetching Question by ID:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.getQuestionById = getQuestionById;
// @desc    Delete a Question
// @route   DELETE /api/questions/:id
// @access  Public
const deleteQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = questionSchema_1.getQuestionByIdBodySchema.safeParse(req.params);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Question ID format.',
                data: validationResult.error.errors,
            });
            return;
        }
        const { id } = validationResult.data;
        yield Questions_1.default.deleteOne({ _id: id });
    }
    catch (error) {
        console.error('Error deleting Question:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.deleteQuestion = deleteQuestion;
// @desc    Update Question status
// @route   PATCH /api/questions/:id/status
// @access  Public
const updateQuestionStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validationResult = questionSchema_1.getQuestionByIdBodySchema.safeParse(req.params);
        if (!validationResult.success) {
            res.status(400).json({
                state: 400,
                message: 'Invalid Question ID format.',
                data: validationResult.error.errors,
            });
            return;
        }
        const questionId = validationResult.data.id;
        const questionToUpdate = yield Questions_1.default.findById(questionId);
        if (!questionToUpdate) {
            res.status(404).json({ state: 404, message: 'Question not found.', data: null });
            return;
        }
        questionToUpdate.status = questionToUpdate.status === 'active' ? 'inactive' : 'active';
        const updatedQuestion = yield questionToUpdate.save();
        res.status(200).json({
            state: 200,
            message: 'Question status toggled successfully',
            data: updatedQuestion,
        });
    }
    catch (error) {
        console.error('Error toggling Question status:', error);
        res.status(500).json({ state: 500, message: error.message || 'Server Error', data: null });
    }
});
exports.updateQuestionStatus = updateQuestionStatus;
