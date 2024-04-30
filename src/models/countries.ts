import mongoose, { Schema, Document } from "mongoose";

export interface CountryDocument extends Document {
  name: string;
  regionName: string;
}

const countrySchema = new Schema<CountryDocument>({
  name: {
    type: String,
    trim: true,
    unique: true,
  },
  regionName: {
    type: String,
    trim: true,
  },
});

countrySchema.index({ name: 1 }, { unique: true }); // unique index on name

countrySchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Countries = mongoose.model("Countries", countrySchema);

export default Countries;
