import { Model } from 'mongoose';
import { CounterDocument } from 'src/common/schemas/counter.schema';

export async function getNextSequence(
  name: string,
  counterModel: Model<CounterDocument>,
): Promise<number> {
  const counter = await counterModel.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
}
