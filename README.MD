# Parkezy 

Parkezy is a smart parking management system that connects parking space owners with users looking for available parking spots. It allows owners to list and manage parking areas, while users can search, view availability, and book parking slots.


---

## 🌐 Live Demo

parkezy.vercel.app

---

## 📌 Features

### 🚙 For Users
- View and search available parking spots
- Real-time availability display (Green = available, Red = booked)
- Book parking slots instantly
- View booking history
- Responsive UI across devices

### 🧑‍💼 For Owners
- Dashboard with two tabs:
  - **Create Parking**: 
    - Select location via map
    - Enter parking name, slots, and upload image
  - **My Parkings**: 
    - View, edit, and delete owned parking areas
    - Visual block view of slots
- Upload profile picture

### 🔐 Authentication
- JWT-based secure login/signup
- Separate flows for User and Owner

### 🗺️ Map Integration
- Owners can select location via interactive map (Leaflet)
- Users can view map of parking area 

---

## 🛠️ Tech Stack

| Tech             | Description                                |
|------------------|--------------------------------------------|
| **Frontend**     | React.js, Tailwind CSS, Vite               |
| **Backend**      | Node.js, Express.js                        |
| **Database**     | MongoDB with Mongoose                      |
| **Auth**         | JWT, bcrypt                                |
| **Maps**         | Leaflet                                    |
| **Image Upload** | Cloudinary                                 |

---