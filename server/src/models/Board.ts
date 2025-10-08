import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    sharedWith: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const boardSchema = new Schema<IBoard>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'My Board'
    },
    sharedWith: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

boardSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model<IBoard>('Board', boardSchema);
