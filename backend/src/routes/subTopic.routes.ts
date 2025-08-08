import { Router } from 'express';
import { 
    getAllSubTopics, 
    createSubTopic,
    getSubTopicById,
    updateSubTopic, 
    deleteSubTopic 
} from '../controllers/subTopic.controller';

const router = Router();

router.route('/')
    .get(getAllSubTopics)
    .post(createSubTopic);

router.route('/:id')
    .get(getSubTopicById)
    .put(updateSubTopic)
    .delete(deleteSubTopic);

export default router;