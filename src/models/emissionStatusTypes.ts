import mongoose, { Schema, Document } from "mongoose";

export interface EmissionStatusTypeDocument extends Document {
  type: string;
}

const emissionStatusTypesSchema = new Schema<EmissionStatusTypeDocument>({
  type: {
    type: String,
    trim: true,
  },
});

emissionStatusTypesSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const EmissionStatusTypes = mongoose.model("EmissionStatusTypes", emissionStatusTypesSchema);

export default EmissionStatusTypes;
