# social_media (Express + Sequelize + Cloudinary)

This is a scaffold backend built with Express.js, Sequelize (MySQL), and Cloudinary file upload support.

## Quick start

1. Install dependencies
```bash
npm install
```

2. Edit `.env` and set your Cloudinary keys (or leave placeholders):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=08022004
DB_NAME=social_media_db
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=change_this_jwt_secret
```

3. Create the database in MySQL:
```sql
CREATE DATABASE social_media_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Run in development:
```bash
npm run dev
```

Server will start on PORT specified in `.env` (default 3000). The project auto syncs models to DB on startup (`sequelize.sync({ alter: true })`).

---

APIs include: auth, users (profile/avatar), posts (with media upload to Cloudinary), likes, comments, friendships, notifications.

Upload endpoint expects `multipart/form-data`:
- `POST /api/posts` with `media` files and `content` field. Include `Authorization: Bearer <token>` header.
- `POST /api/users/avatar` with single `avatar` file to upload user avatar.
