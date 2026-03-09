const express = require('express');
const router = express.Router();
const postController = require('../controllers/postControllers');

router.post('/api/posts', postController.createPost);
router.get('/api/posts', postController.getAllPosts);
router.get('/api/posts/:id', postController.getPostById);
router.put('/api/posts/:id', postController.updatePost);
router.patch('/api/posts/:id', postController.patchPost);
router.delete('/api/posts/:id', postController.deletePost);

module.exports = router;