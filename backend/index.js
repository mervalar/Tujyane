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
const BookingModel   = require('./models/booking.model.js');
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

// GET /api/trips/:id
app.get('/api/trips/:id', async (req, res) => {
  try {
    const trip = await TripModel.findById(req.params.id).populate('driver', 'fullname avatar');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ trip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────
   PASSENGER BOOKING ROUTES
───────────────────────────────────────────── */

// POST /api/bookings  — book a trip
app.post('/api/bookings', protect, async (req, res) => {
  try {
    const { tripId, seatsBooked = 1 } = req.body;
    if (!tripId) return res.status(400).json({ message: 'tripId is required' });

    const trip = await TripModel.findById(tripId);
    if (!trip)                    return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'active') return res.status(400).json({ message: 'Trip is not available' });
    if (trip.seatsAvailable < seatsBooked)
      return res.status(400).json({ message: 'Not enough seats available' });

    const booking = await BookingModel.create({
      trip: tripId,
      passenger: req.user._id,
      seatsBooked,
      totalPrice: trip.price * seatsBooked,
    });

    trip.seatsAvailable -= seatsBooked;
    await trip.save();

    res.status(201).json({ message: 'Booking confirmed', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/me  — current user's bookings
app.get('/api/bookings/me', protect, async (req, res) => {
  try {
    const bookings = await BookingModel.find({ passenger: req.user._id })
      .populate({ path: 'trip', populate: { path: 'driver', select: 'fullname avatar' } })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/bookings/:id  — cancel a booking
app.delete('/api/bookings/:id', protect, async (req, res) => {
  try {
    const booking = await BookingModel.findOne({ _id: req.params.id, passenger: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    await TripModel.findByIdAndUpdate(booking.trip, { $inc: { seatsAvailable: booking.seatsBooked } });

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN ROUTES  (admin role only)
───────────────────────────────────────────── */

// GET /api/admin/stats
app.get('/api/admin/stats', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers, totalDrivers, totalPassengers,
      totalTrips, activeTrips, completedTrips, cancelledTrips,
      totalBookings, confirmedBookings,
      activeDrivers, pendingDrivers,
      thisMonthUsers, lastMonthUsers,
      thisMonthBookings, lastMonthBookings,
      thisMonthRevenue,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ role: 'driver' }),
      UserModel.countDocuments({ role: 'passenger' }),
      TripModel.countDocuments(),
      TripModel.countDocuments({ status: 'active' }),
      TripModel.countDocuments({ status: 'completed' }),
      TripModel.countDocuments({ status: 'cancelled' }),
      BookingModel.countDocuments(),
      BookingModel.find({ status: 'confirmed' }).select('totalPrice'),
      UserModel.countDocuments({ role: 'driver', isVerified: true }),
      UserModel.countDocuments({ role: 'driver', isVerified: false, $or: [{ rejectionReason: null }, { rejectionReason: '' }] }),
      UserModel.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      UserModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      BookingModel.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      BookingModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      BookingModel.find({ status: 'confirmed', createdAt: { $gte: startOfThisMonth } }).select('totalPrice'),
    ]);

    const totalRevenue = confirmedBookings.reduce((s, b) => s + b.totalPrice, 0);
    const thisMonthRevenueTotal = thisMonthRevenue.reduce((s, b) => s + b.totalPrice, 0);

    const pct = (curr, prev) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;

    res.json({
      totalUsers, totalDrivers, totalPassengers,
      totalTrips, activeTrips, completedTrips, cancelledTrips,
      totalBookings, totalRevenue,
      activeDrivers, pendingDrivers,
      currency: 'RWF',
      monthlyGrowth: {
        users: pct(thisMonthUsers, lastMonthUsers),
        bookings: pct(thisMonthBookings, lastMonthBookings),
        revenue: thisMonthRevenueTotal,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};
    if (search) query.$or = [{ fullname: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role)              query.role = role;
    if (status === 'active')   query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const users = await UserModel.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/ban
app.patch('/api/admin/users/:id/ban', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User banned', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/unban
app.patch('/api/admin/users/:id/unban', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User unbanned', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/drivers
app.get('/api/admin/drivers', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { role: 'driver' };
    if (status === 'approved') { query.isVerified = true; }
    if (status === 'pending')  { query.isVerified = false; query.rejectionReason = { $in: [null, ''] }; }
    if (status === 'rejected') { query.isVerified = false; query.rejectionReason = { $nin: [null, ''] }; }

    const drivers = await UserModel.find(query).select('-password').sort({ createdAt: -1 });
    const driverIds = drivers.map(d => d._id);
    const vehicles = await VehicleModel.find({ driver: { $in: driverIds } });
    const vehicleMap = {};
    vehicles.forEach(v => { vehicleMap[v.driver.toString()] = v; });

    const result = drivers.map(d => ({
      ...d.toObject(),
      vehicle: vehicleMap[d._id.toString()] || null,
    }));
    res.json({ drivers: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/drivers/:id/approve
app.patch('/api/admin/drivers/:id/approve', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const driver = await UserModel.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { isVerified: true, rejectionReason: '' },
      { new: true }
    ).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver approved', driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/drivers/:id/reject
app.patch('/api/admin/drivers/:id/reject', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const driver = await UserModel.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      { isVerified: false, rejectionReason: reason || 'Rejected by admin' },
      { new: true }
    ).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver rejected', driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/trips
app.get('/api/admin/trips', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { search, type, status } = req.query;
    const query = {};
    if (search) query.$or = [{ 'from.city': new RegExp(search, 'i') }, { 'to.city': new RegExp(search, 'i') }];
    if (type)   query.type = type;
    if (status) query.status = status;

    const trips = await TripModel.find(query)
      .populate('driver', 'fullname email')
      .sort({ createdAt: -1 });
    res.json({ trips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/trips/:id/cancel
app.patch('/api/admin/trips/:id/cancel', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const trip = await TripModel.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip cancelled', trip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/bookings
app.get('/api/admin/bookings', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (status) query.status = status;

    let bookings = await BookingModel.find(query)
      .populate('passenger', 'fullname email')
      .populate({ path: 'trip', populate: { path: 'driver', select: 'fullname' } })
      .sort({ createdAt: -1 });

    if (search) {
      const re = new RegExp(search, 'i');
      bookings = bookings.filter(b =>
        re.test(b.passenger?.fullname) ||
        re.test(b.passenger?.email)    ||
        re.test(b.trip?.from?.city)    ||
        re.test(b.trip?.to?.city)
      );
    }

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/bookings/:id/cancel
app.patch('/api/admin/bookings/:id/cancel', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'cancelled';
    await booking.save();
    await TripModel.findByIdAndUpdate(booking.trip, { $inc: { seatsAvailable: booking.seatsBooked } });

    res.json({ message: 'Booking cancelled', booking });
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
