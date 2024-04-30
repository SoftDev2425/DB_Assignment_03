import mongoose, { Schema, Document } from "mongoose";

export interface GHG_EmissionsDocument extends Document {
  reportingYear: number;
  measurementYear: number;
  boundary: string;
  methodology: string;
  methodologyDetails: string;
  description: string;
  comment: string;
  gassesIncluded: string;
  totalCityWideEmissionsCO2: number;
  totalScope1_CO2: number;
  totalScope2_CO2: number;
  organisation_id: mongoose.Types.ObjectId;
  emissionStatusType_id: mongoose.Types.ObjectId;
}

const GHG_EmissionsSchema = new Schema<GHG_EmissionsDocument>({
  reportingYear: {
    type: Number,
  },
  measurementYear: {
    type: Number,
  },
  boundary: {
    type: String,
    trim: true,
  },
  methodology: {
    type: String,
    trim: true,
  },
  methodologyDetails: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  comment: {
    type: String,
    trim: true,
  },
  gassesIncluded: {
    type: String,
    trim: true,
  },
  totalCityWideEmissionsCO2: {
    type: Number,
  },
  totalScope1_CO2: {
    type: Number,
  },
  totalScope2_CO2: {
    type: Number,
  },
  organisation_id: {
    type: Schema.Types.ObjectId,
    ref: "Organisations",
  },
  emissionStatusType_id: {
    type: Schema.Types.ObjectId,
    ref: "EmissionStatusTypes",
  },
});

GHG_EmissionsSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const GHG_Emissions = mongoose.model("GHG_emissions", GHG_EmissionsSchema);

export default GHG_Emissions;
