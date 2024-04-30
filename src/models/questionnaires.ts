import mongoose, { Schema, Document } from "mongoose";

export interface QuestionnairesDocument extends Document {
  name: string;
  data: Object;
  organisation_id: mongoose.Types.ObjectId;
}

const questionnairesSchema = new Schema<QuestionnairesDocument>({
  name: {
    type: String,
    trim: true,
  },
  data: {
    type: Object,
    trim: true,
  },
  organisation_id: {
    type: Schema.Types.ObjectId,
    ref: "Organisations",
  },
});

questionnairesSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Questionnaires = mongoose.model("Questionnaires", questionnairesSchema);

export default Questionnaires;
