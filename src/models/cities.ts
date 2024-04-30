import mongoose, { Schema, Document } from "mongoose";

export interface CityDocument extends Document {
  name: string;
  C40Status: boolean;
  country_id: mongoose.Types.ObjectId;
}

const citySchema = new Schema<CityDocument>({
  name: {
    type: String,
    trim: true,
    unique: true,
  },
  C40Status: {
    type: Boolean,
  },
  country_id: {
    type: Schema.Types.ObjectId,
    ref: "Countries",
  },
});

citySchema.index({ name: 1 }, { unique: true }); // unique index on name

citySchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Cities = mongoose.model("Cities", citySchema);

export default Cities;
