# 🖨️ PrintSpec — Printing Method Recommendation System

> A full-stack web application that helps businesses instantly find compatible printing methods for promotional products, complete with color limits, production timelines, and per-method product images.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Smart Search** | Live product search with debounce |
| 🗂️ **Category Filters** | Filter by Drinkware, Apparel, Bags, etc. |
| 🎨 **Recommendation Engine** | Returns available printing methods with color limits & notes |
| ⏱️ **Production Times** | Per-method production time with quantity conditions |
| 📷 **Product Images** | Upload a main image and a separate image per printing method |
| 🔐 **Admin Panel** | JWT-protected CRUD panel for managing all products |
| 🖼️ **Method Image Cards** | Each printing method card shows its own specific image |
| 📱 **Responsive UI** | Dark premium theme, works on all screen sizes |

---

## 🛠️ Tech Stack

### Backend
- **Python 3.9+** with [FastAPI](https://fastapi.tiangolo.com/)
- **SQLite** via `aiosqlite` (async)
- **JWT Authentication** via `python-jose`
- **Static file serving** for uploaded images

### Frontend
- **React 18** + [Vite](https://vitejs.dev/)
- **React Router v6** for navigation
- **Axios** for API calls
- **Vanilla CSS** — dark premium design system

---

## 📁 Project Structure

```
Specification System/
├── backend/
│   ├── main.py              ← FastAPI app, CORS, static files
│   ├── database.py          ← SQLite setup + 19 products pre-seeded
│   ├── models.py            ← Pydantic models
│   ├── requirements.txt
│   └── routers/
│       ├── products.py      ← CRUD API (GET / POST / PUT / DELETE)
│       ├── recommend.py     ← Recommendation engine + production time parser
│       ├── images.py        ← Product & per-method image upload/delete
│       └── auth.py          ← JWT login
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.jsx           ← Router + protected admin route
│       ├── index.css         ← Full dark theme design system
│       ├── pages/
│       │   ├── Home.jsx      ← Product search + grid
│       │   ├── Recommend.jsx ← Method cards with images & production times
│       │   ├── Login.jsx     ← Admin login
│       │   └── Admin.jsx     ← CRUD panel + image management
│       └── components/
│           └── Navbar.jsx
├── Product printing spec.xlsx   ← Original data source
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- pip

---

### 1. Clone the repository

```bash
git clone https://github.com/maheshprintarts/Products-Printing-Method-.git
cd "Products-Printing-Method-"
```

---

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```

Backend will be available at: **http://localhost:8000**  
API Docs (Swagger UI): **http://localhost:8000/docs**

---

### 3. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🔐 Admin Credentials

| Username | Password |
|----------|----------|
| `admin` | `admin123` |

> The admin panel allows you to add, edit, delete products and upload images.

---

## 📦 Pre-loaded Products (19 total)

Categories include:

- ✏️ **Writing** — Pen (Metal, Paper, Plastic)
- 👜 **Bags** — Tote Bag (Cloth, Paper), Bag
- ☕ **Drinkware** — Bottle (Plastic), Mug (Plastic, Ceramic, Steel)
- 🔑 **Accessories** — Keychain, Card Holder
- 📒 **Stationery** — Diary/Planner (Paper, Leather), Table Calendar
- 📱 **Tech Accessories** — Mobile Stand (Metal, Plastic)
- 👕 **Apparel** — T-Shirt
- 🎯 **Novelty** — Stress Ball

---

## 🖨️ Supported Printing Methods

| Method | Description |
|--------|-------------|
| Screen Printing | 1–4 color(s) |
| UV Printing | 1–3 color(s) |
| Offset Printing | Multi-color |
| Digital Printing | Multi-color |
| Laser Engraving | Engraved finish |
| DTG / DTF | Multi-color fabric |
| Embroidery | Multi-color thread |
| Sublimation | Multi-color full coverage |

---

## 🖼️ Image Upload

### Main Product Image
- Go to **Admin → Edit product → 🖼️ Images tab**
- Drag & drop or click to upload (JPG, PNG, WEBP — max 5 MB)
- Shows on the product card in the home grid and in the recommendation header

### Per-Method Images
- In the same **Images tab**, upload a different image for each available printing method
- Each method card on the recommendation page shows its specific image, fully visible (`object-fit: contain`)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products (search & filter) |
| `POST` | `/api/products` | Create product (auth required) |
| `PUT` | `/api/products/{id}` | Update product (auth required) |
| `DELETE` | `/api/products/{id}` | Delete product (auth required) |
| `GET` | `/api/recommend/{id}` | Get recommendations for a product |
| `POST` | `/api/products/{id}/upload-image` | Upload main product image |
| `POST` | `/api/products/{id}/method-image/{method_key}` | Upload per-method image |
| `POST` | `/api/auth/login` | Get JWT token |

---

## 📄 License

This project is built for **Mahesh Printarts** internal use.

---

> Built with ❤️ using FastAPI + React
