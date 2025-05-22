const db = require('../db');
const generateUniqueId = require('../utils/generateUniqueId');


/**
 * Создает пост с прикрепленным изображением.
 * @param {string} title - Заголовок поста
 * @param {string} content - Содержание поста
 * @param {string} role - Роль, для которой предназначен пост
 * @param {boolean} public_post - Флаг публичности поста
 * @param {Array<string>} student_groups - Массив групп студентов
 * @param {Object} image - Объект изображения (multer)
 * @returns {Promise<Object>} Объект с ID поста и сообщением об успехе
 * @throws {Error} При ошибке загрузки изображения или записи в БД
 */
async function createPostWithImage(title, content, role, public_post, student_groups, image) {
    console.log("creating Data with Image");
    console.log(title);
    console.log(content);

    console.log(image);

    let image_path = null;
    const userId = generateUniqueId('post');
    try {
        if (image) {
            console.log("request has image");

            const ext = path.extname(image.originalname);
            const filename = `${Date.now()}${ext}`;
            image_path = path.join('uploads', filename);
            console.log(image_path);
            console.log(image);
            console.log(image.buffer);

            await fs.promises.writeFile(path.join(__dirname, image_path), image.buffer);
        }

        const sql = `INSERT INTO posts (id, title, content, role, student_groups, public_post, date_created, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        return new Promise((resolve, reject) => {
            const today = new Date();
            const formattedDate = [
                String(today.getDate()).padStart(2, '0'),
                String(today.getMonth() + 1).padStart(2, '0'),
                today.getFullYear()
            ].join('.');

            db.run(sql, [userId, title, content, role, JSON.stringify(student_groups), public_post, formattedDate, image_path], function (err) {
                if (err) {
                    console.error("Ошибка базы данных:", err.message);
                    return reject(new Error("Ошибка регистрации поста"));
                }
                resolve({
                    userId,
                    message: "Запись успешно зарегистрирована",
                });
            });
        });
    } catch (error) {
        console.log("some image error");

        if (image_path) {
            try {
                await fs.promises.unlink(path.join(__dirname, image_path));
            } catch (unlinkError) {
                console.error('Ошибка удаления изображения:', unlinkError);
            }
        }
        throw error;
    }
};
/**
 * Получает все посты из базы данных.
 * @returns {Promise<Array>} Массив всех постов
 * @throws {Error} При ошибке запроса к базе данных
 */
async function getAllPosts() {
    console.log("getting all posts");

    const sql = `SELECT * FROM posts`;
    return new Promise((resolve, reject) => {
        db.all(sql, function (err, rows) {
            if (err) return reject(new Error("Ошибка вывода всех постов"));
            resolve(rows);
        });
    });
}

/**
 * Находит пост по его идентификатору.
 * @param {string} id - ID поста
 * @returns {Promise<Object>} Объект поста
 * @throws {Error} При ошибке запроса или если пост не найден
 */
async function getPostById(id) {
    const sql = `SELECT * FROM posts WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.all(sql, [id], function (err, rows) {
            if (err) return reject(new Error("Ошибка вывода поста"));
            resolve(rows[0] || null);
        });
    });
}

/**
 * Получает все посты, предназначенные для определенной роли.
 * Включает как публичные, так и приватные посты для указанной роли.
 * 
 * @param {string} role - Роль пользователя (например: 'student', 'teacher')
 * @returns {Promise<Array<Object>>} Промис с массивом постов для указанной роли
 * @throws {Error} Если произошла ошибка при выполнении запроса к БД
 * 
 * @example
 * // Получить все посты для преподавателей
 * const teacherPosts = await getPostByRole("teacher");
 */
async function getPublicPostsByRole(role) {
    const sql = `SELECT * FROM posts WHERE role = ? and public_post = 1`;

    return new Promise((resolve, reject) => {
        db.all(sql, [role], function (err, rows) {
            if (err) {
                console.error("Ошибка базы данных:", err.message);
                return reject(new Error("Ошибка получения постов по роли"));
            }
            resolve(rows);
        });
    });
}

/**
 * Получает все посты, предназначенные для определенной роли.
 * Включает как публичные, так и приватные посты для указанной роли.
 * 
 * @param {string} role - Роль пользователя (например: 'student', 'teacher')
 * @returns {Promise<Array<Object>>} Промис с массивом постов для указанной роли
 * @throws {Error} Если произошла ошибка при выполнении запроса к БД
 * 
 * @example
 * // Получить все посты для преподавателей
 * const teacherPosts = await getPostByRole("teacher");
 */
async function getPostByRole(role) {
    const sql = `SELECT * FROM posts WHERE role = ?`;

    return new Promise((resolve, reject) => {
        db.all(sql, [role], function (err, rows) {
            if (err) {
                console.error("Ошибка базы данных:", err.message);
                return reject(new Error("Ошибка получения постов по роли"));
            }
            resolve(rows);
        });
    });
}

/**
 * Получает посты, доступные для студентов указанной группы.
 * Фильтрует публичные студенческие посты, проверяя принадлежность к группе.
 * 
 * @param {string} groupToFind - Идентификатор группы студентов для фильтрации
 * @returns {Promise<Array<Object>>} Промис с массивом подходящих постов
 * @throws {Error} Если произошла ошибка при выполнении запроса к БД
 * 
 * @example
 * // Получить посты для группы "CS-101"
 * const posts = await getPostsForStudent("CS-101");
 */
async function getPublicPostsForStudentByGroup(groupToFind) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM posts WHERE role = ? AND public_post = ?",
            ['student', '1'],
            (err, rows) => {
                if (err) {
                    console.error("Ошибка базы данных:", err.message);
                    return reject(new Error("Ошибка получения студенческих постов"));
                }

                const matchingPosts = rows.filter(post => {
                    try {
                        if (!post.student_groups) return false;
                        const groups = JSON.parse(post.student_groups);
                        return groups.includes(groupToFind);
                    } catch (e) {
                        console.error(`Ошибка обработки групп для поста ${post.id}:`, e);
                        return false;
                    }
                });

                resolve(matchingPosts);
            }
        );
    });
}
async function getAllPostsForStudentByGroup(groupToFind) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT * FROM posts WHERE role = ?",
            ['student', '1'],
            (err, rows) => {
                if (err) {
                    console.error("Ошибка базы данных:", err.message);
                    return reject(new Error("Ошибка получения студенческих постов"));
                }

                const matchingPosts = rows.filter(post => {
                    try {
                        if (!post.student_groups) return false;
                        const groups = JSON.parse(post.student_groups);
                        return groups.includes(groupToFind);
                    } catch (e) {
                        console.error(`Ошибка обработки групп для поста ${post.id}:`, e);
                        return false;
                    }
                });

                resolve(matchingPosts);
            }
        );
    });
}
/**
 * Обновляет существующий пост.
 * @param {string} id - ID поста
 * @param {string} title - Новый заголовок
 * @param {string} content - Новое содержание
 * @param {string} role - Новая роль
 * @param {boolean} public_post - Новый флаг публичности
 * @param {Array<string>} student_groups - Новый массив групп
 * @returns {Promise<Object>} Обновленный объект поста
 * @throws {Error} При ошибке обновления или если пост не найден
 */
async function updatePost(id, title, content, role, public_post, student_groups) {
    const updateSql = `UPDATE posts SET title = ?, content = ?, role = ?, student_groups = ?, public_post = ?, date_created = ? WHERE id = ?`;
    const today = new Date();
    const formattedDate = [
        String(today.getDate()).padStart(2, '0'),
        String(today.getMonth() + 1).padStart(2, '0'),
        today.getFullYear()
    ].join('.');

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(updateSql, [title, content, role, JSON.stringify(student_groups), public_post, formattedDate, id], function (err) {
                if (err) return reject(new Error("Ошибка обновления поста"));

                db.get(`SELECT * FROM posts WHERE id = ?`, [id], (err, row) => {
                    if (err) return reject(new Error("Ошибка получения обновленного поста"));
                    if (!row) return reject(new Error("Пост не найден"));
                    resolve(row);
                });
            });
        });
    });
}

/**
 * Удаляет пост по его идентификатору.
 * @param {string} id - ID поста для удаления
 * @returns {Promise<string>} Сообщение об успешном удалении
 * @throws {Error} При ошибке удаления
 */
async function deletePost(id) {
    const sql = "DELETE FROM posts WHERE id = ?";
    return new Promise((resolve, reject) => {
        db.run(sql, [id], (err) => {
            if (err) return reject(new Error(`Ошибка удаления поста с id: ${id}`));
            resolve("OK");
        });
    });
}

module.exports = {
    createPostWithImage,
    getAllPosts,
    getPostById,
    getPublicPostsByRole,
    getPostByRole,
    getPublicPostsForStudentByGroup,
    getAllPostsForStudentByGroup,
    updatePost,
    deletePost,
}