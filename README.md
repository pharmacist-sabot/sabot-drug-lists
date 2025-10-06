# Hospital Drug Formulary Management System

A comprehensive web application for managing a hospital's drug formulary, built with Vue 3, Vite, and powered by a Supabase backend. This system provides an administrative interface for viewing, searching, adding, editing, and decommissioning drugs from the hospital's official list.

## ✨ Key Features

-   **Role-Based Access Control**: Differentiates between regular users (view-only) and administrators with full CRUD (Create, Read, Update, Delete) capabilities.
-   **Full Drug Lifecycle Management**:
    -   Add new drugs to the formulary.
    -   Edit existing drug information (e.g., name, category).
    -   Decommission drugs with a required justification, moving them to a separate historical view.
    -   Recommission drugs from the inactive list back to the active formulary.
-   **Powerful Data Handling**:
    -   **Bulk CSV Import**: Admins can quickly populate or update the drug list by uploading a CSV file.
    -   **Server-Side Pagination**: Efficiently handles large drug lists without performance degradation.
    -   **Dynamic Search & Filtering**: Instantly search by drug code, trade name, or generic name, and filter by drug category.
-   **User-Friendly Interface**:
    -   A clean, responsive, and modern UI with a dedicated navigation sidebar.
    -   Separate views for active and decommissioned drugs.
    -   Modals for all major actions (Add/Edit, Decommission, CSV Upload).
    -   Real-time toast notifications for user feedback on actions (success, error, info).
-   **Supabase Integration**: Leverages Supabase for database, authentication, and role management.

## 🛠️ Technology Stack

-   **Frontend Framework**: [Vue 3](https://vuejs.org/) (using Composition API and `<script setup>`)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **Routing**: [Vue Router](https://router.vuejs.org/)
-   **CSV Parsing**: [PapaParse](https://www.papaparse.com/)
-   **Styling**: Custom CSS with CSS Custom Properties 

## 🔌 Supabase Backend Setup

This project is a frontend application and requires a Supabase project for its backend functionality. You will need to set up your own Supabase project with the following schema:

1.  **`drugs` Table**: A table to store drug information. Essential columns include:
    -   `id` (uuid, primary key)
    -   `drug_code` (text)
    -   `trade_name` (text)
    -   `generic_name` (text)
    -   `account` (text)
    -   `price_opd` (numeric)
    -   `category` (text)
    -   `is_active` (boolean, default: `true`)
    -   `remarks` (text, for decommission reason)
    -   `decommissioned_at` (timestamp)

2.  **`profiles_drugcupsabot` Table**: A table linked to Supabase Auth users to manage roles.
    -   `id` (uuid, foreign key to `auth.users.id`)
    -   `role` (text, e.g., 'admin' or 'viewer')

3.  **Authentication**: Enable Email/Password authentication in your Supabase project.

4.  **Database Functions (Optional but Recommended)**: The project uses an RPC function `get_unique_categories` to populate the category filter. You can create this in the Supabase SQL Editor.

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or newer)
-   [npm](https://www.npmjs.com/) or another package manager
-   A Supabase project (see section above)

### Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pharmacist-sabot/sabot-drug-lists.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd sabot-drug-lists
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example:
    ```bash
    cp .env
    ```
    Then, fill in the `.env` file with your Supabase Project URL and Anon Key, which can be found in your Supabase project's API settings.

    ```env
    # .env
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📦 Building for Production

To create a production-ready build of the application:

```bash
npm run build
```

The compiled assets will be located in the `dist/` directory, ready for deployment to any static hosting service.

## 📁 Project Structure

```
.
├── public/               # Static assets
├── src/
│   ├── assets/           # Global CSS
│   ├── components/       # Reusable Vue components (Table, Modals, Navbar, etc.)
│   ├── router/           # Vue Router configuration
│   ├── views/            # Page-level components (HomeView, DecommissionedView)
│   ├── App.vue           # Root Vue component with layout and auth logic
│   ├── main.js           # Application entry point
│   └── supabaseClient.js # Supabase client initialization
├── .env                  # Environment variable template
├── index.html            # Main HTML file
├── package.json          # Project dependencies and scripts
└── vite.config.js        # Vite configuration
```
