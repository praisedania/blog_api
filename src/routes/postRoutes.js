const validate = require('../middleware/validate');
const postSchemas = require('../utils/validation/postSchemas');
const router = express.Router();

router.post('/', authenticateToken, requireAuthor, validate(postSchemas.createPost), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', authenticateToken, postController.getPostById);
router.put('/:id', authenticateToken, requireAuthor, validate(postSchemas.updatePost), postController.updatePost);
router.patch('/:id', authenticateToken, postController.patchPost);
router.delete('/:id', authenticateToken, postController.deletePost);

// Admin-only post management routes
router.get('/admin', authenticateToken, requireAdmin, postController.getAllPostsAdmin);
router.post('/admin/:id/approve', authenticateToken, requireAdmin, postController.approvePost);
router.post('/admin/:id/reject', authenticateToken, requireAdmin, postController.rejectPost);
router.get('/admin/stats', authenticateToken, requireAdmin, postController.getPostStats);

module.exports = router;