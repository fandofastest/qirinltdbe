# Qirin Health — API Documentation

## Base URL

- Development: `http://localhost:3000`
- All endpoints are under: `/api/...`

## Response Format

### Success

```json
{
  "success": true,
  "data": "..."
}
```

### Error

```json
{
  "success": false,
  "message": "..."
}
```

## Authentication

This API uses **JWT (Bearer token)**.

### Header

Send the token in:

```
Authorization: Bearer <JWT>
```

### JWT Payload

- `userId`
- `role` (`user` | `admin`)

### How to get a token

- `POST /api/auth/register` (returns token)
- `POST /api/auth/login` (returns token)

## Superadmin (from env)

If you set the following in `.env.local`:

- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`
- `SUPERADMIN_NAME` (optional)

Then calling `POST /api/auth/login` with those credentials will **auto create/update** a MongoDB user with:

- `email = SUPERADMIN_EMAIL`
- `role = "admin"`

This removes the need to manually update an admin role in MongoDB.

---

# Auth

## POST `/api/auth/register`

Create a normal user account.

### Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Success (201)

```json
{
  "success": true,
  "data": {
    "token": "<JWT>",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "..."
    }
  }
}
```

### Notes

- If `email` equals `SUPERADMIN_EMAIL` (and env is set), then:
  - `password` must match `SUPERADMIN_PASSWORD`
  - account is created/updated as `role: "admin"`

---

## POST `/api/auth/login`

Login and get JWT.

### Body

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Success (200)

```json
{
  "success": true,
  "data": {
    "token": "<JWT>",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "..."
    }
  }
}
```

### Notes

- If `email` equals `SUPERADMIN_EMAIL` and password matches `SUPERADMIN_PASSWORD`, the API will auto-provision admin user and return an admin JWT.

---

## GET `/api/auth/me`

Get the current authenticated user profile (from token).

### Auth

Required.

### Success (200)

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## POST `/api/auth/logout`

Logout (optional). JWT is stateless; backend returns success and the client should delete token.

### Success (200)

```json
{
  "success": true,
  "data": {
    "loggedOut": true
  }
}
```

---

# User

## GET `/api/user/profile`

Get your profile.

### Auth

Required.

---

## PUT `/api/user/change-password`

Change password (security standard).

### Auth

Required.

### Body

```json
{
  "currentPassword": "old",
  "newPassword": "new"
}
```

### Notes

- `newPassword` must be at least 8 characters.

---

## DELETE `/api/user/account`

Delete account (Google Play compliance).

### Auth

Required.

### Behavior

- Delete the user
- Delete all logs owned by the user (weight, blood pressure, glucose)

### Success (200)

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## PUT `/api/user/profile`

Update profile.

### Auth

Required.

### Body (any fields optional)

```json
{
  "name": "New Name",
  "password": "newPassword123"
}
```

### Success

Returns updated user (without password).

---

# Weight Logs

Ownership rule:

- A user can only read/create their own logs.
- A user can only delete their own logs.
- An admin can delete any user’s logs.

## POST `/api/weight`

Create weight log.

### Auth

Required.

### Body

```json
{
  "weight": 70.5,
  "date": "2026-02-20T00:00:00.000Z"
}
```

### Success (201)

Returns created log.

---

## GET `/api/weight`

List your weight logs (sorted by `date` desc).

### Auth

Required.

---

## DELETE `/api/weight/{id}`

Delete a weight log by id.

### Auth

Required.

---

# Blood Pressure Logs

Ownership rule:

- A user can only read/create their own logs.
- A user can only delete their own logs.
- An admin can delete any user’s logs.

## POST `/api/blood-pressure`

Create blood pressure log.

### Auth

Required.

### Body

```json
{
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "date": "2026-02-20T00:00:00.000Z"
}
```

---

## GET `/api/blood-pressure`

List your blood pressure logs (sorted by `date` desc).

### Auth

Required.

---

## DELETE `/api/blood-pressure/{id}`

Delete a blood pressure log.

### Auth

Required.

---

# Glucose Logs

Ownership rule:

- A user can only read/create their own logs.
- A user can only delete their own logs.
- An admin can delete any user’s logs.

## POST `/api/glucose`

Create glucose log.

### Auth

Required.

### Body

```json
{
  "glucoseLevel": 95,
  "date": "2026-02-20T00:00:00.000Z"
}
```

---

## GET `/api/glucose`

List your glucose logs (sorted by `date` desc).

### Auth

Required.

---

## DELETE `/api/glucose/{id}`

Delete a glucose log.

### Auth

Required.

---

# Admin

RBAC rule:

- All admin endpoints require `role: "admin"`

## GET `/api/admin/users`

List all users.

### Auth

Admin required.

### Query

- `page` (default: `1`)
- `limit` (default: `20`, max: `100`)

### Success

```json
{
  "success": true,
  "data": {
    "total": 120,
    "page": 1,
    "limit": 20,
    "users": [
      {
        "_id": "...",
        "name": "...",
        "email": "...",
        "role": "admin",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

---

## DELETE `/api/admin/users/{id}`

Delete a user by id.

### Auth

Admin required.

### Notes

- This deletes the user document only (does not cascade-delete logs).

---

## GET `/api/admin/stats`

Get aggregated stats for admin dashboard.

### Auth

Admin required.

### Success (200)

```json
{
  "success": true,
  "data": {
    "totalUsers": 120,
    "totalWeightLogs": 500,
    "totalBloodPressureLogs": 300,
    "totalGlucoseLogs": 200
  }
}
```
