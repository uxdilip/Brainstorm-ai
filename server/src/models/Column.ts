import mongoose, { Document, Schema } from 'mongoose';

export interface IColumn extends Document {
  boardId: mongoose.Types.ObjectId;
  title: string;
  position: number;
  createdAt: Date;
}

const columnSchema = new Schema<IColumn>({
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
  position: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IColumn>('Column', columnSchema);
