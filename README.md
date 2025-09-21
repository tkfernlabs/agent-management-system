# Agent Management System

A full-stack application for managing AI agents, conversations, and tools. Built with React frontend and Express backend using Neon PostgreSQL database.

## Features

- **Agent Management**: Create, update, delete, and view AI agents
- **Conversation Tracking**: Track conversations between users and agents
- **Message History**: Store and retrieve message history for each conversation
- **Tool Management**: Manage tools available to each agent
- **Real-time Statistics**: View system statistics and usage metrics

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL (Neon Database)
- CORS enabled for cross-origin requests
- RESTful API architecture

### Frontend
- React with modern hooks
- Tailwind CSS for styling
- Axios for API communication
- Responsive design

## API Endpoints

### Backend API
Base URL: `https://backend-api-morphvm-2yfon1cr.http.cloud.morph.so`

#### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get single agent
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

#### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/agents/:agentId/conversations` - Get conversations by agent
- `POST /api/conversations` - Create new conversation

#### Messages
- `GET /api/conversations/:conversationId/messages` - Get messages for conversation
- `POST /api/messages` - Create new message

#### Agent Tools
- `GET /api/agent-tools` - Get all agent tools
- `GET /api/agents/:agentId/tools` - Get tools for specific agent
- `POST /api/agent-tools` - Add tool to agent
- `PUT /api/agent-tools/:id` - Update agent tool
- `DELETE /api/agent-tools/:id` - Delete agent tool

#### Statistics
- `GET /api/stats` - Get system statistics
- `GET /api/health` - Health check endpoint

## Installation

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=your_neon_database_url
PORT=3001
```

### Frontend (.env)
```
REACT_APP_API_URL=https://backend-api-morphvm-2yfon1cr.http.cloud.morph.so
```

## Database Schema

The application uses the following tables:
- `agents` - Stores agent information
- `conversations` - Stores conversation data
- `messages` - Stores individual messages
- `agent_tools` - Stores tool configurations for agents

## Live Demo

- Backend API: https://backend-api-morphvm-2yfon1cr.http.cloud.morph.so
- Frontend: [To be deployed]

## License

MIT
