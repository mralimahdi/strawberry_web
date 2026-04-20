const mongoose = require('mongoose');

async function clearDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/strawberry-farm');
    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Drop each collection
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    console.log('All collections dropped successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

clearDatabase();