const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const FormData = require('./models/FormData');
const formRoutes = require('./routes/formRoutes');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Define a variable to hold the mock user ID
let mockUserId;

// Mock the authentication middleware
jest.mock('./middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    // Use the mockUserId variable, which can be changed in each test
    req.user = { _id: mockUserId };
    next();
  },
  adminOnly: (req, res, next) => next(),
}));

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  app = express();
  app.use(express.json());
  app.use('/api', formRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await FormData.deleteMany({});
  // Reset the mock user ID after each test
  mockUserId = new mongoose.Types.ObjectId();
});

describe('DELETE /api/delete-form', () => {
  it('should return 404 if no form exists for the user', async () => {
    // Set a random user ID for a user that has no form
    mockUserId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete('/api/delete-form');

    // This test will initially fail because the controller sends 200 instead of 404
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Form not found to delete');
  });

  it('should return 200 and delete the form if it exists', async () => {
    // Create a form for a specific user
    const userId = new mongoose.Types.ObjectId();
    const address = {
      line1: '123 Main St',
      city: 'Anytown',
      pincode: '12345',
      state: 'CA',
    };
    const form = new FormData({
      userId: userId,
      firstName: 'John',
      lastName: 'Doe',
      mobile: '1234567890',
      email: 'john.doe@example.com',
      gender: 'male',
      maritalStatus: 'Single',
      communicationAddress: address,
      presentAddress: address,
    });
    await form.save();

    // Set the mock user ID to match the form's owner
    mockUserId = userId;

    const response = await request(app)
      .delete('/api/delete-form');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Form deleted successfully');

    // Verify the form is deleted
    const deletedForm = await FormData.findById(form._id);
    expect(deletedForm).toBeNull();
  });
});