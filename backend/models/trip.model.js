const mongoose = require('mongoose');

const TripSchema = mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: {
    city: { type: String, required: true },
    address: { type: String, default: '' },
  },
  to: {
    city: { type: String, required: true },
    address: { type: String, default: '' },
  },
  date: { type: Date, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, default: '' },
  seatsTotal: { type: Number, required: true, min: 1 },
  seatsAvailable: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'RWF' },
  description: { type: String, default: '' },
  type: { type: String, enum: ['carpool', 'bus'], default: 'carpool' },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
