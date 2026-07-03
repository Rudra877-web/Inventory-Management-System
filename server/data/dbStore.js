import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'localdb.json');

// Initialize database file if it doesn't exist
const initializeDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      investments: [],
      transactions: [],
      goals: [],
      notifications: [],
      kyc: [],
      watchlists: [],
      activityLogs: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

initializeDb();

// Read data
const readData = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read local DB file:', err);
    return {
      users: [],
      investments: [],
      transactions: [],
      goals: [],
      notifications: [],
      kyc: [],
      watchlists: [],
      activityLogs: []
    };
  }
};

// Write data
const writeData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write local DB file:', err);
    return false;
  }
};

class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async find(query = {}) {
    const data = readData();
    let results = data[this.collectionName] || [];
    
    // Simple filter matching
    return results.filter(item => {
      for (const key in query) {
        // Handle basic matches
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(doc) {
    const data = readData();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    
    data[this.collectionName] = data[this.collectionName] || [];
    data[this.collectionName].push(newDoc);
    writeData(data);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const data = readData();
    const items = data[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index === -1) return null;
    
    // Extract actual fields from $set if used, or just apply direct updates
    const actualUpdate = update.$set ? { ...items[index], ...update.$set } : { ...items[index], ...update };
    
    items[index] = {
      ...actualUpdate,
      _id: id, // preserve ID
      updatedAt: new Date().toISOString()
    };
    
    data[this.collectionName] = items;
    writeData(data);
    return items[index];
  }

  async findOneAndUpdate(query, update, options = { new: true }) {
    const item = await this.findOne(query);
    if (!item) return null;
    return this.findByIdAndUpdate(item._id, update, options);
  }

  async findByIdAndDelete(id) {
    const data = readData();
    const items = data[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id);
    
    if (index === -1) return null;
    
    const removed = items.splice(index, 1)[0];
    data[this.collectionName] = items;
    writeData(data);
    return removed;
  }

  async deleteMany(query = {}) {
    const data = readData();
    const items = data[this.collectionName] || [];
    
    const remaining = items.filter(item => {
      for (const key in query) {
        if (query[key] !== undefined && item[key] === query[key]) {
          return false; // delete this
        }
      }
      return true;
    });

    const deletedCount = items.length - remaining.length;
    data[this.collectionName] = remaining;
    writeData(data);
    return { deletedCount };
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

export const dbStore = {
  users: new MockModel('users'),
  investments: new MockModel('investments'),
  transactions: new MockModel('transactions'),
  goals: new MockModel('goals'),
  notifications: new MockModel('notifications'),
  kyc: new MockModel('kyc'),
  watchlists: new MockModel('watchlists'),
  activityLogs: new MockModel('activityLogs')
};
