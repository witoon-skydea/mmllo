# MMLLO - A Trello Clone

MMLLO is a Trello-like kanban board application built with Node.js and SQLite. It allows users to create boards, lists, and cards to organize their tasks and projects.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete boards
- Create, read, update, and delete lists
- Create, read, update, and delete cards
- Drag and drop cards between lists
- Reorder lists and cards
- Add comments to cards
- Assign due dates to cards
- Add labels to cards
- Board sharing and collaboration
- Star/unstar boards

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (primary), MongoDB (optional)
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: (Planned for future implementation - React.js)

## Project Structure

```
mmllo/
├── src/
│   ├── config/          # Configuration files (SQLite and MongoDB)
│   ├── controllers/     # Route controllers
│   ├── database/        # SQLite database files
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── public/          # Static files (CSS, JS, images)
│   ├── routes/          # API routes
│   ├── views/           # Frontend views (EJS templates)
│   └── index.js         # App entry point
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # npm package configuration
└── README.md            # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mmllo.git
   cd mmllo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   DB_PATH=./src/database/mmllo.sqlite
   MONGODB_URI=your_mongodb_connection_string  # Optional - for MongoDB integration
   BASE_PATH=/mmllo  # Optional - for subdirectory deployment
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. The server will be running at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Boards

- `GET /api/boards` - Get all boards for current user
- `POST /api/boards` - Create a new board
- `GET /api/boards/:id` - Get a specific board with lists and cards
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board
- `PATCH /api/boards/:id/star` - Toggle star status of a board

### Lists

- `GET /api/lists/board/:boardId` - Get all lists for a board
- `POST /api/lists/board/:boardId` - Create a new list
- `PUT /api/lists/:id` - Update a list
- `DELETE /api/lists/:id` - Delete a list
- `PATCH /api/lists/:id/move` - Move a list to a new position

### Cards

- `GET /api/cards/:id` - Get a specific card with comments
- `POST /api/cards/list/:listId` - Create a new card
- `PUT /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card
- `PATCH /api/cards/:id/move` - Move a card to a new position in the same list
- `PATCH /api/cards/:id/move-to-list` - Move a card to another list
- `POST /api/cards/:id/comments` - Add a comment to a card

### Board Members

- `POST /api/boards/:id/members` - Add a member to a board
- `PUT /api/boards/:boardId/members/:userId` - Update a member's role
- `DELETE /api/boards/:boardId/members/:userId` - Remove a member from a board

## License

This project is licensed under the ISC License.
