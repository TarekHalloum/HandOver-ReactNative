# HandOver – Mobile Platform (Full Version)

## Overview

**HandOver** is a full-stack mobile platform uniting **home services**, **AI-powered vehicle diagnostics**, and **community emergency aid** into one seamless application.
It leverages **React Native** for cross-platform UI, **Laravel** for secure API management, **Flask** for AI inference, and **Azure SQL Server** for structured, cloud-hosted data handling.

The system bridges gaps between daily maintenance and humanitarian support, helping users request trusted services, diagnose car damage via AI, or seek immediate community aid all within a unified, accessible mobile app.

---

## Core Features

* **Home Services** – Book professional repairs or improvements with AI-based décor color detection.
* **Vehicle Diagnostics** – Upload car images; the AI engine detects **brand logos** and **damaged parts**, then matches users with certified repairers.
* **Emergency Aid** – Request or donate essentials (food, shelter, mattresses, water) through real-time peer-to-peer matching.
* **Admin Panel** – Manage users, repairers, and donations via a secure Laravel dashboard.
* **Cross-Domain Reputation System** – Unified rating and urgency-based ranking across all services.

---

## User Roles & Navigation

* **Animated Logo** – The app launches with an animated logo displayed on the welcome page.
* **Guest User** – Can explore the platform but has **limited access** to core features such as requests and donations.
* **Normal User** – Has full access to all services (home, car, and aid).
* **Repairer** – Has a **distinct homepage** and a **dedicated burger menu** layout optimized for repair-related features.
* **Supplier Mode** – Any registered user (normal or repairer) can act as a **supplier**, offering materials or services through the donation or contractor modules.

---

## System Architecture

* **Frontend:** React Native (TypeScript)
* **Backend:** Laravel 10 REST API (JWT Auth, Queues)
* **AI Engine:** Flask + PyTorch (Car damage & color detection)
* **Database:** Azure SQL Server 2022 (Spatial Indexes, ACID Compliant)
* **Messaging:** RabbitMQ (Async Event Bus)
* **Utilities:** Resend API (Emails), OpenCV (Color Analysis)
* **CI/CD:** Docker + GitHub Actions (Zero-Downtime Deployment)
* **Cloud Hosting:** Azure App Service & Azure Container Registry

---

## Run Locally

### 1- Clone the Repository

```bash
git clone https://github.com/TarekHalloum/HandOver-ReactNative.git
cd HandOver-ReactNative
```

### 2- Start the AI Service (Flask)

```bash
cd backend/flask-ai
python app.py
```

### 3- Start the Backend (Laravel)

```bash
cd backend/laravel
php artisan serve
```

### 4- Start the Mobile App (React Native)

```bash
cd frontend
npx expo start
```

The app will be available on your emulator or Expo mobile client.

---

## Technical Highlights

* **Microservice Architecture** ensuring modularity and fault isolation
* **AI Integration** with real-time CNN inference for car damage and brand recognition
* **Event-Driven Workflows** via RabbitMQ for asynchronous operations
* **Secure Communication** using HTTPS, JWT tokens, and AES encryption
* **GDPR & ISO 27001 Compliance** ensuring data protection and privacy

---

## Performance Benchmarks

| Metric                  | Result (P95) | Tool         |
| ----------------------- | ------------ | ------------ |
| `/api/car/scan` latency | 820 ms       | Postman      |
| Home service booking    | 450 ms       | JMeter       |
| Emergency aid match     | 4.7 s        | SQL Profiler |
| API throughput          | 230 req/s    | k6 Cloud     |

---

## Presentation

**Detailed slides available here:**
[Google Presentation – HandOver FYP](https://docs.google.com/presentation/d/1-YhfuHsM7A15E_P5RqWvQ_5-UJfGG-41/edit?usp=sharing)

---

## License

MIT License © 2025 **Tarek Halloum**
