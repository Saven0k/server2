const {
    getAllPosts,
    getPostById,
    getPostByRole,
    getPublicPostsByRole,
    getPublicPostsForStudentByGroup,
    getAllPostsForStudentByGroup,
    createPostWithImage,
    updatePost,
    deletePost,
} = require('../db/services/posts');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await getAllPosts();
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPostById = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await getPostById(id);
        res.json({ post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPostByRole = async (req, res) => {
    const { role } = req.body;
    try {
        const posts = await getPostByRole(role);
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicPostsByRole = async (req, res) => {
    const { forField } = req.body;
    try {
        const posts = await getPublicPostsByRole(forField);
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPublicPostsForStudentByGroup = async (req, res) => {
    const { group } = req.body;
    try {
        const posts = await getPublicPostsForStudentByGroup(group);
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPostsForStudentByGroup = async (req, res) => {
    const { group } = req.body;
    try {
        const posts = await getAllPostsForStudentByGroup(group);
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPostWithImage = upload.single('image'), async (req, res) => {
    try {
        const { title, content, typeVisible, group, publicPost } = req.body;
        const imagePath = req.file;
        const post = await createPostWithImage(
            title,
            content,
            typeVisible,
            group,
            publicPost,
            imagePath
        );
        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePost = async (req, res) => {
    const { id, name, text, forField, visible, group } = req.body;
    try {
        const updatedPost = await updatePost(id, name, text, forField, visible, group);
        res.json({ message: "Пост обновлен", post: updatedPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        await deletePost(postId);
        res.json({ message: "Post deleted successfully", status: "ok" });
    } catch (err) {
        console.error("Error deleting post: ", err);
        res.status(500).send("Error deleting post");
    }
};