require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');
const { OpenAI } = require('openai');
const { ChatOpenAI } = require('langchain/chat_models/openai');
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize LangChain
const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4'
});

// Initialize express app
const app = express();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Contract Reviewer Agent
const contractReviewPrompt = new PromptTemplate({
  inputVariables: ['contractText'],
  template: `Please review this freelance contract and identify any potential issues, ambiguities, or missing sections. 
  Focus on:
  1. Payment terms and milestones
  2. Scope of work
  3. Intellectual property rights
  4. Confidentiality clauses
  5. Dispute resolution
  6. Termination conditions
  
  Contract Text: {contractText}
  
  Provide a detailed analysis with specific recommendations for improvement.`
});

const contractReviewChain = new LLMChain({
  llm: chatModel,
  prompt: contractReviewPrompt
});

// Dispute Resolver Agent
const disputeResolverPrompt = new PromptTemplate({
  inputVariables: ['milestone', 'clientFeedback', 'freelancerResponse'],
  template: `Please analyze this dispute between a client and freelancer regarding a milestone submission.
  
  Milestone Details: {milestone}
  Client Feedback: {clientFeedback}
  Freelancer Response: {freelancerResponse}
  
  Provide:
  1. An objective analysis of both sides
  2. Specific recommendations for resolution
  3. Suggested fair compensation adjustments if needed
  4. Steps to prevent similar disputes in the future`
});

const disputeResolverChain = new LLMChain({
  llm: chatModel,
  prompt: disputeResolverPrompt
});

// Chat Monitor Agent
const chatMonitorPrompt = new PromptTemplate({
  inputVariables: ['chatHistory'],
  template: `Please analyze this chat history between a client and freelancer for:
  1. Unprofessional behavior
  2. Potential red flags
  3. Communication issues
  4. Signs of dissatisfaction
  5. Risk of dispute
  
  Chat History: {chatHistory}
  
  Provide a risk assessment and recommendations for platform intervention if needed.`
});

const chatMonitorChain = new LLMChain({
  llm: chatModel,
  prompt: chatMonitorPrompt
});

// Routes
app.post('/review-contract', async (req, res) => {
  try {
    const { contractText } = req.body;
    const result = await contractReviewChain.call({ contractText });
    res.json({ analysis: result.text });
  } catch (error) {
    logger.error('Contract review error:', error);
    res.status(500).json({ error: 'Failed to analyze contract' });
  }
});

app.post('/resolve-dispute', async (req, res) => {
  try {
    const { milestone, clientFeedback, freelancerResponse } = req.body;
    const result = await disputeResolverChain.call({
      milestone,
      clientFeedback,
      freelancerResponse
    });
    res.json({ resolution: result.text });
  } catch (error) {
    logger.error('Dispute resolution error:', error);
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
});

app.post('/monitor-chat', async (req, res) => {
  try {
    const { chatHistory } = req.body;
    const result = await chatMonitorChain.call({ chatHistory });
    res.json({ analysis: result.text });
  } catch (error) {
    logger.error('Chat monitoring error:', error);
    res.status(500).json({ error: 'Failed to analyze chat' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`AI Services running on port ${PORT}`);
}); 