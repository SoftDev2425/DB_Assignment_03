import mongoose, { Schema, Document } from "mongoose";

export interface OrganisationsDocument extends Document {
  accountNo: number;
  name: string;
  city_id: Schema.Types.ObjectId;
  country_id: Schema.Types.ObjectId;
}

const organisationSchema = new Schema<OrganisationsDocument>({
  accountNo: {
    type: Number,
  },
  name: {
    type: String,
    trim: true,
  },
  city_id: {
    type: Schema.Types.ObjectId,
    ref: "Cities",
  },
  country_id: {
    type: Schema.Types.ObjectId,
    ref: "Countries",
  },
});

organisationSchema.index({ name: 1 }, { unique: true }); // unique index on name

organisationSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Organisations = mongoose.model("Organisations", organisationSchema);

export default Organisations;
