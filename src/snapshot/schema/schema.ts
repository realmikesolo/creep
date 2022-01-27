import { Schema, model } from 'mongoose';

export const UserSchema = new Schema({
  steamId: String,
  snapshots: [{ wins: Number, losses: Number }],
});
export const UserModel = model('User', UserSchema);
