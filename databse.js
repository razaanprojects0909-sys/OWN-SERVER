const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// Schema for storing user submissions
const SubmissionSchema = new mongoose.Schema({
  projectId: { type: String, required: true, index: true },
  type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  amount: { type: Number, required: true },
  utr: { type: String, default: null }, // Only for deposit
  ipAddress: { type: String },
  userAgent: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

SubmissionSchema.index({ projectId: 1, submittedAt: -1 });

const Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = { connectDB, Submission };