import mongoose, { Document, Schema } from 'mongoose';

export interface ICard extends Document {
  columnId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  position: number;
  embedding?: number[];
  mood?: 'positive' | 'neutral' | 'negative';
  clusterId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>({
  columnId: {
    type: Schema.Types.ObjectId,
    ref: 'Column',
    required: true
  },
  boardId: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  position: {
    type: Number,
    required: true,
    default: 0
  },
  embedding: [{
    type: Number
  }],
  mood: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  clusterId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICard>('Card', cardSchema);
