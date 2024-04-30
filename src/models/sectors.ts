import mongoose, { Schema, Document } from "mongoose";

export interface SectorDocument extends Document {
  name: string;
}

const sectorSchema = new Schema<SectorDocument>({
  name: {
    type: String,
    trim: true,
    unique: true,
  },
});

sectorSchema.index({ name: 1 }, { unique: true }); // unique index on name

sectorSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Sectors = mongoose.model("Sectors", sectorSchema);

export default Sectors;
