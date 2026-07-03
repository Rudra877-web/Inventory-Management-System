import mongoose from 'mongoose';
import { dbStore } from '../data/dbStore.js';

let isConnected = false;

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log('⚠️ MONGO_URI not specified. Falling back to local JSON database store.');
    isConnected = false;
    return false;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🚀 MongoDB Connected Successfully');
    isConnected = true;
    return true;
  } catch (err) {
    console.error(`⚠️ MongoDB Connection Failed: ${err.message}. Falling back to local JSON database store.`);
    isConnected = false;
    return false;
  }
};

export const getModel = (modelName, schema) => {
  // Get collection name by pluralizing the modelName: e.g. "User" -> "users"
  const collectionKey = modelName.toLowerCase() === 'kyc' ? 'kyc' : modelName.toLowerCase() + 's';
  
  // Register with Mongoose first if it's not already registered
  let MongooseModel;
  try {
    if (mongoose.models[modelName]) {
      MongooseModel = mongoose.model(modelName);
    } else {
      MongooseModel = mongoose.model(modelName, schema);
    }
  } catch (err) {
    console.warn(`Error registering model ${modelName} with Mongoose:`, err.message);
  }

  // Return a combined interface
  return {
    find: async (query = {}) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.find(query);
      }
      return await dbStore[collectionKey].find(query);
    },
    findOne: async (query = {}) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.findOne(query);
      }
      return await dbStore[collectionKey].findOne(query);
    },
    findById: async (id) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.findById(id);
      }
      return await dbStore[collectionKey].findById(id);
    },
    create: async (data) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.create(data);
      }
      return await dbStore[collectionKey].create(data);
    },
    findByIdAndUpdate: async (id, update, options = { new: true }) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.findByIdAndUpdate(id, update, options);
      }
      return await dbStore[collectionKey].findByIdAndUpdate(id, update, options);
    },
    findOneAndUpdate: async (query, update, options = { new: true }) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.findOneAndUpdate(query, update, options);
      }
      return await dbStore[collectionKey].findOneAndUpdate(query, update, options);
    },
    findByIdAndDelete: async (id) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.findByIdAndDelete(id);
      }
      return await dbStore[collectionKey].findByIdAndDelete(id);
    },
    deleteMany: async (query = {}) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.deleteMany(query);
      }
      return await dbStore[collectionKey].deleteMany(query);
    },
    countDocuments: async (query = {}) => {
      if (isConnected && MongooseModel) {
        return await MongooseModel.countDocuments(query);
      }
      return await dbStore[collectionKey].countDocuments(query);
    }
  };
};

export const checkConnection = () => isConnected;
