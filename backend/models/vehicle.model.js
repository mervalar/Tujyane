const mongoose = require('mongoose');

const VehicleSchema = mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  make: { type: String, default: null },
  model: { type: String, default: null },
  year: { type: Number, default: null },
  plateNumber: { type: String, default: null, sparse: true },
  color: { type: String, default: null },
  seats: { type: Number, default: null, min: 1, max: 14 },
  type: { type: String, enum: ['sedan', 'suv', 'minibus', 'pickup', 'van', 'other'], default: 'sedan' },
  licenseNumber: { type: String, default: null },
  insuranceDoc: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
