// src/routes/users.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController')

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/public/role', postController.getPublicPostsByRole);
router.post('/role', postController.getPostByRole);
router.post('/public/group', postController.getPublicPostsForStudentByGroup);
router.post('/group', postController.getAllPostsForStudentByGroup);
router.post('/addWithImage', postController.createPostWithImage);
router.put('/update/:id', postController.updatePost);
router.delete('/delete/:id', postController.deletePost);


module.exports = router;