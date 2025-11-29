# Sabot Drug Lists (Hospital Drug Formulary Management System)

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Pinia](https://img.shields.io/badge/pinia-%23ffd859.svg?style=for-the-badge&logo=pinia&logoColor=black)

A modern, comprehensive **Progressive Web Application (PWA)** for managing a hospital's drug formulary. Built with **Vue 3**, **Vite**, and **Supabase**, this system streamlines the process of viewing, searching, adding, editing, and decommissioning drugs from the hospital's official list.

## ✨ Key Features

-   **📱 Progressive Web App (PWA)**: Fully installable on desktop and mobile devices with offline capabilities and auto-updates.
-   **🔐 Role-Based Access Control**: Secure access with distinct roles for **Administrators** (full CRUD access) and **Viewers** (read-only).
-   **💊 Full Drug Lifecycle Management**:
    -   **Create**: Add new drugs to the formulary.
    -   **Read**: Advanced search and filtering capabilities.
    -   **Update**: Edit existing drug details.
    -   **Decommission**: Move drugs to a historical archive with required justification.
    -   **Recommission**: Restore drugs to the active list.
-   **⚡ High Performance**:
    -   **State Management**: Powered by [Pinia](https://pinia.vuejs.org/) for efficient and reactive data handling.
    -   **Server-Side Pagination**: Optimized for handling large datasets without performance degradation.
    -   **Instant Search**: Real-time filtering by drug code, trade name, generic name, or category.
-   **🛠️ Powerful Admin Tools**:
    -   **Bulk CSV Import**: Rapidly populate or update the database using CSV files.
-   **🎨 Modern UI/UX**:
    -   **Responsive Design**: Built with [Tailwind CSS](https://tailwindcss.com/) for a mobile-first experience.
    -   **Clean Iconography**: Using [Lucide Vue](https://lucide.dev/) for consistent and beautiful icons.
    -   **Interactive Feedback**: Real-time toast notifications for user actions.

## 🛠️ Technology Stack

-   **Frontend Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
-   **Backend & Auth**: [Supabase](https://supabase.io/)
-   **PWA Support**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
-   **Icons**: [Lucide Vue](https://lucide.dev/)
-   **CSV Parsing**: [PapaParse](https://www.papaparse.com/)

## 🔌 Supabase Backend Setup

This project requires a Supabase project for its backend. Ensure your project has the following schema:

1.  **`drugs` Table**:
    -   `id` (uuid, PK)
    -   `drug_code` (text)
    -   `trade_name` (text)
    -   `generic_name` (text)
    -   `account` (text)
    -   `price_opd` (numeric)
    -   `category` (text)
    -   `is_active` (boolean, default: `true`)
    -   `remarks` (text)
    -   `decommissioned_at` (timestamp)

2.  **`profiles_drugcupsabot` Table**:
    -   `id` (uuid, FK to `auth.users.id`)
    -   `role` (text: `'admin'` or `'viewer'`)

3.  **Authentication**: Enable Email/Password authentication.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or newer)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/pharmacist-sabot/sabot-drug-lists.git
    cd sabot-drug-lists
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```bash
    cp .env
    ```
    Update the `.env` file with your Supabase credentials:
    ```env
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The artifacts will be in the `dist/` directory.

## 📁 Project Structure

```
src/
├── assets/          # Global styles (Tailwind) and static assets
├── components/      # Reusable Vue components (UI elements, Modals)
├── router/          # Vue Router configuration
├── services/        # API calls and external service logic
├── stores/          # Pinia state stores
├── views/           # Page-level components
├── App.vue          # Root component
├── main.js          # Application entry point
└── supabaseClient.js # Supabase client configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
