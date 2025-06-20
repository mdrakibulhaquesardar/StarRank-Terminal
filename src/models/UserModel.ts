// src/models/UserModel.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { DeveloperBadge, DeveloperStats } from '@/types';

// Interface for the data that will be stored in MongoDB
export interface IUser extends Document {
  githubUsername: string; // Primary key
  avatarUrl: string;
  name: string;
  country: string;
  location?: string;
  bio?: string;
  xpScore: number;
  rank?: number; // Rank can be dynamic or stored if calculated globally
  stats: DeveloperStats & { publicGistsCount: number }; // Ensured publicGistsCount is not optional here for DB schema
  badges: DeveloperBadge[];
  programmingLanguages: string[];
  organizations: { login: string; avatar_url: string }[];
  lastSyncedAt: Date;
  dataAiHint?: string;
}

const UserSchema: Schema<IUser> = new Schema({
  githubUsername: { type: String, required: true, unique: true, index: true },
  avatarUrl: { type: String, required: true },
  name: { type: String, required: true },
  country: { type: String },
  location: { type: String },
  bio: { type: String },
  xpScore: { type: Number, default: 0, index: true },
  rank: { type: Number },
  stats: {
    totalStars: { type: Number, default: 0 },
    totalForks: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    weeklyCommits: { type: Number, default: 0 },
    publicRepoCount: { type: Number, default: 0 },
    publicGistsCount: {type: Number, default: 0, required: true }, // Made required for clarity
  },
  badges: [{
    id: String,
    emoji: String,
    title: String,
    explanation: String,
  }],
  programmingLanguages: [{ type: String }],
  organizations: [{
    login: String,
    avatar_url: String,
  }],
  lastSyncedAt: { type: Date, default: Date.now },
  dataAiHint: { type: String },
});

// Prevent model overwrite in Next.js hot reload
const UserModel = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
