import mongoose, { Schema, Document } from "mongoose";

export interface PopulationDocument extends Document {
  count: number;
  year: number;
  city_id: Schema.Types.ObjectId;
}

const populationSchema = new Schema<PopulationDocument>({
  count: {
    type: Number,
  },
  year: {
    type: Number,
  },
  city_id: {
    type: Schema.Types.ObjectId,
    ref: "Cities",
  },
});

populationSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Populations = mongoose.model("Populations", populationSchema);

export default Populations;
