import mongoose, { Schema, Document } from "mongoose";

export interface TargetTypeDocument extends Document {
  type: string;
}

const targetTypeSchema = new Schema<TargetTypeDocument>({
  type: {
    type: String,
    trim: true,
  },
});

targetTypeSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const TargetTypes = mongoose.model("TargetTypes", targetTypeSchema);

export default TargetTypes;
