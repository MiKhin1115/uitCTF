import mongoose, { Schema, models, model } from "mongoose";

export type IEvent = {
  name: string;
  startsAt: Date;
  endsAt: Date;
};

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export const Event = models.Event || model<IEvent>("Event", EventSchema);
