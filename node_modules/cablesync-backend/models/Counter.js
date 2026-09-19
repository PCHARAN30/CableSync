const mongoose = require("mongoose");

// A simple model to atomically increment a counter for generating unique
// sequential IDs, like the customer serialNumber.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return counter.seq;
};

const { mockCounter } = require("../config/mockStore");

const RealCounter = mongoose.model("Counter", counterSchema);

const CounterProxy = new Proxy(RealCounter, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1) {
      if (prop in mockCounter) {
        return typeof mockCounter[prop] === "function"
          ? mockCounter[prop].bind(mockCounter)
          : mockCounter[prop];
      }
    }
    return Reflect.get(target, prop);
  },
});

module.exports = CounterProxy;
