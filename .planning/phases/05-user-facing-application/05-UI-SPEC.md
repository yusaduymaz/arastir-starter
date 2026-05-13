# Phase 05: UI Specification

## 1. Design System Contracts

The Araştır application aims for a clean, professional, and trustworthy aesthetic suitable for financial research. It utilizes standard Tailwind CSS utility classes.

### Typography
- **Font Family**: Standard sans-serif (Inter, Roboto, or system defaults).
- **Headings**: Bold, dark gray (`text-gray-900`).
  - H1: `text-3xl font-bold tracking-tight`
  - H2: `text-2xl font-semibold`
- **Body Text**: `text-gray-600` or `text-gray-700` for high readability.

### Colors
- **Primary Action**: A deep blue or indigo (`bg-blue-600 hover:bg-blue-700`).
- **Background**: Very light gray or off-white (`bg-gray-50`) to make content cards pop.
- **Surface (Cards/Forms)**: Pure white (`bg-white`) with subtle borders (`border-gray-200`) and light shadows (`shadow-sm`).
- **Status Indicators**:
  - Success/Completed: `text-green-600 bg-green-50`
  - Warning/Pending: `text-yellow-600 bg-yellow-50`
  - Error/Failed: `text-red-600 bg-red-50`

### Spacing & Layout
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Component Padding**: Standardized padding inside cards (e.g., `p-6` or `p-8`).
- **Gap**: Consistent gaps between elements (e.g., `gap-4` or `gap-6`).

## 2. Core Layout Structure (Authenticated)

The main application will use a standard sidebar or top-navigation layout.

**Top Navigation:**
- **Brand Logo/Name**: "Araştır" (Left)
- **User Profile/Actions**: Logout button (Right)

**Main Content Area:**
- Centered, maximum width container to hold the Dashboard and Results views.

## 3. Component Specifications

### 3.1 Authentication Forms (Login/Register)
- **Container**: Centered vertically and horizontally on the screen (`min-h-screen flex items-center justify-center`).
- **Card**: White card, slight shadow, rounded corners.
- **Fields**:
  - Email (type="email", required)
  - Password (type="password", required, min length 6)
- **Actions**: Primary "Sign In" / "Sign Up" button. Link to toggle between login and registration.
- **Feedback**: Inline error messages below inputs or a top-level alert box for auth failures.

### 3.2 Dashboard Query Form (UI-01)
- **Purpose**: Allow the user to input a BIST ticker to generate a new report.
- **Location**: Top section of the Dashboard page.
- **Input**: Large, prominent text input. Placeholder: "Örn: THYAO, ASELS...".
- **Action**: Primary button "Araştırma Başlat" (Start Research) with a magnifying glass icon or loading spinner when submitting.
- **Behavior**: Upon submission, makes a POST request to the API, disables the button, and optimistically adds a 'pending' row to the history table below.

### 3.3 Results History Table (UI-02, UI-04)
- **Purpose**: Display past and currently processing research requests.
- **Location**: Below the Query Form on the Dashboard.
- **Structure**: A clean, responsive HTML table or a list of cards.
- **Columns/Data Points**:
  - **Tarih (Date)**: Format `dd.MM.yyyy HH:mm`
  - **Hisse/Konu (Query)**: The requested ticker.
  - **Durum (Status)**: Badge component (Tamamlandı, İşleniyor, Hata).
  - **İşlemler (Actions)**: If status is 'Tamamlandı', show two buttons/icons: "PDF İndir" and "PPTX İndir". If 'İşleniyor', show a disabled state or spinner.
- **Empty State**: Friendly message: "Henüz bir araştırma yapmadınız. Yukarıdan bir hisse senedi aratarak başlayabilirsiniz." (You haven't done any research yet. Start by searching for a stock above.)

## 4. State Management and Interaction Flow

1. **Unauthenticated User**: Navigates to `/`. Redirected via middleware to `/login`.
2. **Login/Register**: User fills out form. Next.js Server Action handles Supabase Auth. On success, redirects to `/dashboard`.
3. **Dashboard Load**: Server Component fetches `research_history` from Supabase for the logged-in user and renders the Query Form and History Table.
4. **Submit Query**:
   - User types "THYAO" and clicks "Araştırma Başlat".
   - Client sends POST request to `/api/research`.
   - API creates a 'pending' DB record and kicks off the background agent process.
   - Client receives the new record ID, clears the input, and re-fetches or optimistically updates the History Table to show the new pending row.
5. **Real-time Updates (Optional but Recommended)**: The client component subscribing to Supabase Realtime changes on the `research_history` table to automatically flip the status from 'pending' to 'completed' and display the download buttons without requiring a page refresh.