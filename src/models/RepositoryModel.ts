// src/models/RepositoryModel.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRepository extends Document {
  githubRepoId: number; // GitHub's unique ID for the repo
  ownerUsername: string; // To associate with the user
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  languages: Record<string, number>; // Store all languages
  stars: number;
  forks: number;
  htmlUrl: string;
  lastSyncedAt: Date;
}

const RepositorySchema: Schema<IRepository> = new Schema({
  githubRepoId: { type: Number, required: true, unique: true, index: true },
  ownerUsername: { type: String, required: true, index: true },
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  description: { type: String },
  language: { type: String }, // Primary language
  languages: { type: Schema.Types.Mixed, default: {} }, // e.g., { 'JavaScript': 1024, 'HTML': 512 }
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  htmlUrl: { type: String },
  lastSyncedAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in Next.js hot reload
const RepositoryModel = (mongoose.models.Repository as Model<IRepository>) || mongoose.model<IRepository>('Repository', RepositorySchema);

export default RepositoryModel;
