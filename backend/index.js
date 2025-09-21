const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all agents
app.get('/api/agents', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM agents ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get single agent
app.get('/api/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM agents WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create new agent
app.post('/api/agents', async (req, res) => {
  try {
    const { name, description, capabilities, status } = req.body;
    
    const result = await pool.query(
      'INSERT INTO agents (name, description, capabilities, status, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, description, capabilities || '{}', status || 'inactive']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update agent
app.put('/api/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, capabilities, status } = req.body;
    
    const result = await pool.query(
      'UPDATE agents SET name = $1, description = $2, capabilities = $3, status = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, description, capabilities, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete agent
app.delete('/api/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM agents WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({ message: 'Agent deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Get all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM conversations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation by agent
app.get('/api/agents/:agentId/conversations', async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await pool.query(
      'SELECT * FROM conversations WHERE agent_id = $1 ORDER BY created_at DESC',
      [agentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create new conversation
app.post('/api/conversations', async (req, res) => {
  try {
    const { agent_id, title, context } = req.body;
    
    const result = await pool.query(
      'INSERT INTO conversations (agent_id, title, context, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [agent_id, title, context || '{}']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for conversation
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const result = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new message
app.post('/api/messages', async (req, res) => {
  try {
    const { conversation_id, sender_type, content, metadata } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (conversation_id, sender_type, content, metadata, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [conversation_id, sender_type, content, metadata || '{}']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Get agent tools
app.get('/api/agent-tools', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM agent_tools ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agent tools:', error);
    res.status(500).json({ error: 'Failed to fetch agent tools' });
  }
});

// Get tools for specific agent
app.get('/api/agents/:agentId/tools', async (req, res) => {
  try {
    const { agentId } = req.params;
    const result = await pool.query(
      'SELECT * FROM agent_tools WHERE agent_id = $1 ORDER BY created_at DESC',
      [agentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching agent tools:', error);
    res.status(500).json({ error: 'Failed to fetch agent tools' });
  }
});

// Add tool to agent
app.post('/api/agent-tools', async (req, res) => {
  try {
    const { agent_id, tool_name, tool_config, enabled } = req.body;
    
    const result = await pool.query(
      'INSERT INTO agent_tools (agent_id, tool_name, tool_config, enabled, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [agent_id, tool_name, tool_config || '{}', enabled !== false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding tool to agent:', error);
    res.status(500).json({ error: 'Failed to add tool to agent' });
  }
});

// Update agent tool
app.put('/api/agent-tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tool_config, enabled } = req.body;
    
    const result = await pool.query(
      'UPDATE agent_tools SET tool_config = $1, enabled = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [tool_config, enabled, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent tool not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating agent tool:', error);
    res.status(500).json({ error: 'Failed to update agent tool' });
  }
});

// Delete agent tool
app.delete('/api/agent-tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM agent_tools WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent tool not found' });
    }
    
    res.json({ message: 'Agent tool deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting agent tool:', error);
    res.status(500).json({ error: 'Failed to delete agent tool' });
  }
});

// Database statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const agentCount = await pool.query('SELECT COUNT(*) FROM agents');
    const conversationCount = await pool.query('SELECT COUNT(*) FROM conversations');
    const messageCount = await pool.query('SELECT COUNT(*) FROM messages');
    const toolCount = await pool.query('SELECT COUNT(*) FROM agent_tools');
    
    res.json({
      agents: parseInt(agentCount.rows[0].count),
      conversations: parseInt(conversationCount.rows[0].count),
      messages: parseInt(messageCount.rows[0].count),
      tools: parseInt(toolCount.rows[0].count),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`API available at http://0.0.0.0:${port}/api`);
});
