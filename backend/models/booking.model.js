const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema({
  trip:      { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seatsBooked: { type: Number, required: true, min: 1, default: 1 },
  totalPrice:  { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
