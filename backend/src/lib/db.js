import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Initial MongoDB connection failed: ${error.message}`);
    
    // Retry mechanism
    let retries = 5;
    while (retries) {
      try {
        console.log(`Retrying MongoDB connection, attempts left: ${retries}...`);
        await new Promise(res => setTimeout(res, 5000)); // wait 5 seconds
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (err) {
        retries -= 1;
        console.error(`Retry failed: ${err.message}`);
      }
    }
    
    console.error("Could not connect to MongoDB after retries. Exiting...");
    process.exit(1);
  }
};
