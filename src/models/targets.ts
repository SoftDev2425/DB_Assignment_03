import mongoose, { Schema, Document } from "mongoose";

export interface TargetDocument extends Document {
  reportingYear: number;
  baselineYear: number;
  targetYear: number;
  reductionTargetPercentage: number;
  baselineEmissionsCO2: number;
  comment: string;
  organisation_id: Schema.Types.ObjectId;
  sector_id: Schema.Types.ObjectId;
  targetType_id: Schema.Types.ObjectId;
}

const targetSchema = new Schema<TargetDocument>({
  reportingYear: {
    type: Number,
  },
  baselineYear: {
    type: Number,
  },
  targetYear: {
    type: Number,
  },
  reductionTargetPercentage: {
    type: Number,
  },
  baselineEmissionsCO2: {
    type: Number,
  },
  comment: {
    type: String,
  },
  organisation_id: {
    type: Schema.Types.ObjectId,
    ref: "Organisations",
  },
  sector_id: {
    type: Schema.Types.ObjectId,
    ref: "Sectors",
  },
  targetType_id: {
    type: Schema.Types.ObjectId,
    ref: "TargetTypes",
  },
});

targetSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Targets = mongoose.model("Targets", targetSchema);

export default Targets;
