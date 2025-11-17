const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/User');

describe('User Model Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    test('should create a user successfully with valid data', async () => {
      const userData = {
        clerkId: 'user_test123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+254712345678',
        role: 'buyer'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.clerkId).toBe(userData.clerkId);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.role).toBe('buyer');
      expect(savedUser.wallet.balance).toBe(0);
      expect(savedUser.wallet.currency).toBe('KES');
    });

    test('should fail to create user without clerkId', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      try {
        const user = new User(userData);
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.clerkId).toBeDefined();
      }
    });

    test('should set default role as buyer if not provided', async () => {
      const userData = {
        clerkId: 'user_test456',
        email: 'test2@example.com'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('buyer');
    });

    test('should only allow valid roles', async () => {
      const userData = {
        clerkId: 'user_test789',
        email: 'test3@example.com',
        role: 'invalidRole'
      };

      try {
        const user = new User(userData);
        await user.save();
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      }
    });

    test('should enforce unique clerkId', async () => {
      const userData1 = {
        clerkId: 'user_unique123',
        email: 'user1@example.com'
      };

      const userData2 = {
        clerkId: 'user_unique123',
        email: 'user2@example.com'
      };

      await new User(userData1).save();

      try {
        await new User(userData2).save();
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000);
      }
    });
  });

  describe('User Wallet', () => {
    test('should initialize wallet with default values', async () => {
      const user = new User({
        clerkId: 'user_wallet123',
        email: 'wallet@example.com'
      });

      const savedUser = await user.save();

      expect(savedUser.wallet).toBeDefined();
      expect(savedUser.wallet.balance).toBe(0);
      expect(savedUser.wallet.currency).toBe('KES');
      expect(savedUser.wallet.transactions).toEqual([]);
    });

    test('should update wallet balance', async () => {
      const user = await new User({
        clerkId: 'user_balance123',
        email: 'balance@example.com'
      }).save();

      user.wallet.balance = 1000;
      const updatedUser = await user.save();

      expect(updatedUser.wallet.balance).toBe(1000);
    });
  });

  describe('User Query Methods', () => {
    beforeEach(async () => {
      await User.create([
        {
          clerkId: 'buyer1',
          email: 'buyer1@example.com',
          role: 'buyer'
        },
        {
          clerkId: 'seller1',
          email: 'seller1@example.com',
          role: 'seller'
        },
        {
          clerkId: 'admin1',
          email: 'admin1@example.com',
          role: 'admin'
        }
      ]);
    });

    test('should find user by clerkId', async () => {
      const user = await User.findOne({ clerkId: 'buyer1' });
      expect(user).toBeDefined();
      expect(user.email).toBe('buyer1@example.com');
    });

    test('should find users by role', async () => {
      const buyers = await User.find({ role: 'buyer' });
      expect(buyers).toHaveLength(1);
      expect(buyers[0].clerkId).toBe('buyer1');
    });

    test('should update user information', async () => {
      const user = await User.findOne({ clerkId: 'buyer1' });
      user.firstName = 'UpdatedName';
      await user.save();

      const updatedUser = await User.findOne({ clerkId: 'buyer1' });
      expect(updatedUser.firstName).toBe('UpdatedName');
    });

    test('should delete user', async () => {
      await User.deleteOne({ clerkId: 'buyer1' });
      const user = await User.findOne({ clerkId: 'buyer1' });
      expect(user).toBeNull();
    });
  });
});
