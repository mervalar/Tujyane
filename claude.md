# Tujyane — Rwanda Transport Platform

## Project Overview

Tujyane ("Let's go" in Kinyarwanda) is a transport platform for Rwanda combining:
- **Carpooling**: private car owners offering seats to other passengers
- **Bus booking**: scheduled bus routes with seat reservations

Target users are everyday Rwandans, so the UI prioritizes simplicity, large touch targets, and low-bandwidth performance.

---

## Features

### User (Passenger)
- Search trips by origin, destination, date
- View trip results and filter by type (carpool / bus), price, time
- View trip details (driver info, seats, price)
- Book a trip and receive confirmation
- Dashboard: view upcoming and past bookings, cancel bookings

### Driver (Carpool)
- Register as a driver
- Create trips: set origin, destination, date, time, seats, price
- Manage trips: view bookings, accept/reject passengers
- Dashboard: earnings, active trips, history

### Bus Operator
- Manage bus routes and schedules
- Set prices and available seats per route
- View passenger manifests

### Admin
- Approve driver accounts
- Manage users (ban/unban)
- View platform analytics: trips, bookings, revenue
- Manage bus operators and routes

---

## Frontend Architecture Decisions

- **Framework**: React 18 + Vite (fast dev server, lean bundle)
- **Routing**: React Router v6 (file-based mental model, nested layouts)
- **State**: Context API with `useReducer` — no Redux overhead for this scope
- **HTTP**: Axios with a central instance (`services/api.js`) — easy to swap base URL
- **Styling**: CSS custom properties (design tokens) + component-scoped CSS modules
- **No SSR**: Pure SPA is fine; SEO is not a priority for this booking app

---

## API Structure Assumptions

The frontend assumes a REST API at `VITE_API_BASE_URL` (set in `.env`).

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /trips?from=&to=&date=      | Search trips             |
| GET    | /trips/:id                  | Trip details             |
| POST   | /trips                      | Create a trip (driver)   |
| POST   | /bookings                   | Book a trip              |
| GET    | /bookings/me                | Current user bookings    |
| DELETE | /bookings/:id               | Cancel a booking         |
| GET    | /drivers/me/trips           | Driver's own trips       |
| POST   | /auth/register              | Register                 |
| POST   | /auth/login                 | Login (returns JWT)      |
| GET    | /users/me                   | Current user profile     |

All protected endpoints expect `Authorization: Bearer <token>` header.
The Axios instance in `services/api.js` attaches the token automatically.

---

## Folder Structure

```
src/
├── assets/              Static images, icons, fonts
├── components/          Reusable UI pieces (no business logic)
│   ├── common/          Generic: Button, Input, Modal, Spinner
│   ├── layout/          Navbar, Footer, PageWrapper
│   ├── trip/            TripCard, TripList, FilterPanel
│   └── search/          SearchBar, LocationInput
├── context/             React Context providers
│   ├── AuthContext.jsx  Auth state + token management
│   └── TripContext.jsx  Search/filter state
├── features/            Domain slices (state + components tightly coupled)
│   ├── auth/            Login, Register forms
│   ├── trips/           Search results, trip detail logic
│   ├── bookings/        Booking flow, confirmation
│   ├── user/            Passenger dashboard
│   └── driver/          Driver dashboard, create trip
├── hooks/               Custom hooks (useAuth, useTrips, useBooking)
├── layouts/             Route-level layout shells
│   ├── MainLayout.jsx   Navbar + footer wrapper
│   └── DashboardLayout.jsx  Sidebar dashboard shell
├── pages/               Route entry points (thin — delegate to features)
│   ├── Home.jsx
│   ├── Results.jsx
│   ├── TripDetail.jsx
│   ├── Booking.jsx
│   ├── UserDashboard.jsx
│   ├── DriverDashboard.jsx
│   └── CreateTrip.jsx
├── services/            API layer
│   ├── api.js           Axios instance + base config
│   ├── tripsService.js
│   ├── bookingsService.js
│   └── authService.js
├── utils/               Pure helpers (formatDate, formatPrice, etc.)
├── styles/              Global CSS, design tokens
│   ├── tokens.css
│   └── global.css
├── App.jsx              Router setup
└── main.jsx             Entry point
```

---

## Connecting to the Backend

When the backend is ready:
1. Set `VITE_API_BASE_URL=https://api.tujyane.rw` in `.env.production`
2. Replace mock data in `services/` with real Axios calls (stubs are already there)
3. Remove `src/mocks/` folder
4. Ensure JWT handling in `AuthContext` matches backend token shape

The frontend will work without any other changes.
