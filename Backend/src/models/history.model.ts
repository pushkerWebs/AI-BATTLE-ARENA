import mongoose, { Schema, Document } from 'mongoose';

export interface IBattleHistory extends Document {
  userId: mongoose.Types.ObjectId;
  problem: string;
  solution_1: string;
  solution_2: string;
  model1: string;
  model2: string;
  judgeModel: string;
  judge: {
    solution_1_score: number;
    solution_2_score: number;
    solution_1_reasoning: string;
    solution_2_reasoning: string;
    winner: 'solution_1' | 'solution_2';
    overall_verdict: string;
  };
  createdAt: Date;
}

const BattleHistorySchema = new Schema<IBattleHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problem: {
      type: String,
      required: true,
    },
    solution_1: {
      type: String,
      required: true,
    },
    solution_2: {
      type: String,
      required: true,
    },
    model1: {
      type: String,
      required: true,
    },
    model2: {
      type: String,
      required: true,
    },
    judgeModel: {
      type: String,
      required: true,
    },
    judge: {
      solution_1_score: { type: Number, required: true },
      solution_2_score: { type: Number, required: true },
      solution_1_reasoning: { type: String, required: true },
      solution_2_reasoning: { type: String, required: true },
      winner: { type: String, enum: ['solution_1', 'solution_2'], required: true },
      overall_verdict: { type: String, required: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const BattleHistory = mongoose.model<IBattleHistory>('BattleHistory', BattleHistorySchema);
export default BattleHistory;
