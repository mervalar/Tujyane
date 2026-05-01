const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const UserModel = require('./models/users.model.js');
const VehicleModel = require('./models/vehicle.model.js');
const TripModel = require('./models/trip.model.js');
const generateToken = require('./utils/generateTokens.js');
const dotenv = require('dotenv');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const protect = require('./middleware/auth.js');
const authorizeRoles = require('./middleware/roles.js');
const BlacklistModel = require('./models/blacklisttoken.model.js');
const jwt = require('jsonwebtoken');
dotenv.config();
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Tujyane API'));

/* ─────────────────────────────────────────────
   AUTH ROUTES
───────────────────────────────────────────── */

app.post('/api/users/register', async (req, res) => {
  try {
    const { fullname, email, phone, password, role } = req.body;
    if (!fullname) return res.status(400).json({ message: 'Please provide your full name' });
    if (!email)    return res.status(400).json({ message: 'Please provide your email' });
    if (!phone)    return res.status(400).json({ message: 'Please provide your phone number' });
    if (!password) return res.status(400).json({ message: 'Please provide a password' });
    if (!role)     return res.status(400).json({ message: 'Please choose a role' });

    const existing = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: 'Email or phone number already taken' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ fullname, email, phone, role, password: hashed });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email)    return res.status(400).json({ message: 'Email is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const loginuser = await UserModel.findOne({ email });
    if (!loginuser) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, loginuser.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    loginuser.lastLoginAt = new Date();
    await loginuser.save();
    const token = generateToken(loginuser);

    res.json({
      message: 'Login successful',
      token,
      loginuser: {
        id: loginuser._id,
        fullname: loginuser.fullname,
        email: loginuser.email,
        phone: loginuser.phone,
        role: loginuser.role,
        avatar: loginuser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users/logout', protect, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token);
    await BlacklistModel.create({ token, expiresAt: new Date(decoded.exp * 1000) });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users/profile', protect, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const blacklisted = await BlacklistModel.findOne({ token });
    if (blacklisted) return res.status(401).json({ message: 'Session expired. Please login again.' });

    const user = await UserModel.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────
   DRIVER ROUTES  (all require driver role)
───────────────────────────────────────────── */

// GET  /api/driver/me  — driver profile + vehicle
app.get('/api/driver/me', protect, authorizeRoles('driver', 'admin'), async (req, res) => {
  try {
    const user    = await UserModel.findById(req.user._id).select('-password');
    const vehicle = await VehicleModel.findOne({ driver: req.user._id });
    res.json({ user, vehicle: vehicle || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT  /api/driver/profile  — update personal info
app.put('/api/driver/profile', protect, authorizeRoles('driver', 'admin'), async (req, res) => {
  try {
    const { fullname, phone, avatar } = req.body;
    const updated = await UserModel.findByIdAndUpdate(
      req.user._id,
      { ...(fullname && { fullname }), ...(phone && { phone }), ...(avatar !== undefined && { avatar }) },
      { new: true, select: '-password' }
    );
    res.json({ message: 'Profile updated', user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/driver/vehicle  — create or replace vehicle record
app.post('/api/driver/vehicle', protect, authorizeRoles('driver', 'admin'), async (req, res) => {
  try {
    const { make, model, year, plateNumber, color, seats, type, licenseNumber, insuranceDoc } = req.body;
    const vehicle = await VehicleModel.findOneAndUpdate(
      { driver: req.user._id },
      { make, model, year, plateNumber, color, seats, type, licenseNumber, insuranceDoc },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Vehicle saved', vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET  /api/driver/trips  — all trips created by this driver
app.get('/api/driver/trips', protect, authorizeRoles('driver', 'admin'), async (req, res) => {
  try {
    const trips = await TripModel.find({ driver: req.user._id }).sort({ date: -1 });
    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/driver/trips  — create a new trip
app.post('/api/driver/trips', protect, authorizeRoles('driver', 'admin'), async (req, res) => {
  try {
    const { from, to, date, departureTime, arrivalTime, seatsTotal, price, currency, description, type } = req.body;
    if (!from?.city) return res.status(400).json({ message: 'Departure city is required' });
    if (!to?.city)   return res.status(400).json({ message: 'Destination city is required' });
    if (!date)       return res.status(400).json({ message: 'Date is required' });
    if (!departureTime) return res.status(400).json({ message: 'Departure time is required' });
    if (!seatsTotal || seatsTotal < 1) return res.status(400).json({ message: 'At least 1 seat is required' });
    if (!price || price < 0) return res.status(400).json({ message: 'Price must be 0 or more' });

    const trip = await TripModel.create({
      driver: req.user._id,
      from,
      to,
      date,
      departureTime,
      arrivalTime,
      seatsTotal,
      seatsAvailable: seatsTotal,
      price,
      currency: currency || 'RWF',
      description,
      type: type || 'carpool',
    });
    res.status(201).json({ message: 'Trip created', trip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/driver/trips/:id/cancel
app.patch('/api/driver/trips/:id/cancel', protect, authorizeRoles('driver', 'admin'), async (req, res) => {
  try {
    const trip = await TripModel.findOneAndUpdate(
      { _id: req.params.id, driver: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip cancelled', trip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET  /api/driver/stats  — dashboard stats
app.get('/api/driver/stats', protect, authorizeRoles('driver', 'admin'), async (req, res) => {
  try {
    const trips = await TripModel.find({ driver: req.user._id });
    const totalTrips   = trips.length;
    const activeTrips  = trips.filter(t => t.status === 'active').length;
    const totalSeatsBooked = trips.reduce((s, t) => s + (t.seatsTotal - t.seatsAvailable), 0);
    const totalEarnings    = trips
      .filter(t => t.status !== 'cancelled')
      .reduce((s, t) => s + t.price * (t.seatsTotal - t.seatsAvailable), 0);
    res.json({ totalTrips, activeTrips, totalSeatsBooked, totalEarnings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────
   PUBLIC TRIPS SEARCH
───────────────────────────────────────────── */

app.get('/api/trips', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const query = { status: 'active', seatsAvailable: { $gte: 1 } };
    if (from) query['from.city'] = new RegExp(from, 'i');
    if (to)   query['to.city']   = new RegExp(to, 'i');
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }
    const trips = await TripModel.find(query).populate('driver', 'fullname avatar').sort({ date: 1 });
    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────
   START SERVER
───────────────────────────────────────────── */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
