# KAP Scraping Discovery & Strategy

This document outlines the analysis of kap.org.tr and the proposed strategy for building a robust scraper.

## 1. Search URL & Interaction Analysis

- **Initial Approach:** Navigating directly to a search URL (e.g., `https://www.kap.org.tr/tr/bildirim-sorgu?sirketler=THYAO`) does not work as expected. The page is a Single Page Application (SPA) that loads a template and then fetches data via JavaScript.
- **User Interaction Flow:** A real user performs the following actions:
    1.  Goes to `https://www.kap.org.tr/tr/bildirim-sorgu`.
    2.  Types a company code (e.g., "THYAO") into a search input.
    3.  Selects the company from a dropdown/autocomplete list.
    4.  The page dynamically loads the results.
- **Network Analysis (Key Finding):** The most important discovery is that the search results are fetched via a `POST` request to a backend API endpoint:
    - **URL:** `https://www.kap.org.tr/tr/api/bildirimSorgu`
    - **Method:** `POST`
    - **Payload:** The request sends a JSON payload specifying the search criteria (company code, date range, etc.).

This API endpoint appears to return clean JSON data, which is a much more reliable source than parsing HTML.

## 2. CSS Selectors (Fallback Strategy)

If the API approach fails, parsing the rendered HTML is the fallback. The key selectors are:

- **Results List Container:** `.notifications.v-row`
- **Individual Result Item:** `.v-col-12` within the container.
- **Notification Title:** `.notification-title a`
- **Notification Date:** The date is part of a complex structure, often within a `div` with text like "Pay Geri Alım Bildirimi".
- **Detail Page Link:** The `href` attribute of the `.notification-title a` element.
- **Detail Page Content:** The main content is typically within a `div.modal-body` or a similar container if viewed in a modal, or a main content div on a dedicated page.

## 3. Anti-Scraping Analysis

- The site is a modern SPA (likely built with Vue.js, given the class names like `v-col`). This requires a full browser environment like Puppeteer to execute JavaScript.
- The use of a backend API (`/api/bildirimSorgu`) is a form of protection, as simple `fetch` or `axios` calls without the correct headers, cookies, or payload structure will fail.
- There is no obvious, aggressive anti-scraping like Cloudflare's "I'm under attack mode" or Google's reCAPTCHA on the main search page. However, making too many requests in a short period will likely lead to an IP ban.

## 4. Proposed Puppeteer Strategy (Primary)

The primary strategy will be to **interact with the backend API directly**, as this is the most robust and efficient method.

1.  **Initial Page Load:** Use Puppeteer to navigate to `https://www.kap.org.tr/tr/bildirim-sorgu`. This is necessary to potentially acquire necessary cookies or session tokens that the browser generates.
2.  **API Interception (or Emulation):** Instead of interacting with the UI, use Puppeteer's `page.evaluate` or directly use a library like `axios` (passing along cookies from Puppeteer) to make a `POST` request to `https://www.kap.org.tr/tr/api/bildirimSorgu`.
3.  **Construct Payload:** The payload for the POST request will be constructed dynamically based on the target company ticker. A sample payload looks like this:
    ```json
    {
        "fromDate": "2023-10-28",
        "toDate": "2024-01-28",
        "companyCode": "THYAO",
        // ... other optional fields
    }
    ```
4.  **Process JSON Response:** The API returns a JSON array of notification objects. Parse this directly. This JSON contains the title, date, company info, and a URL to the detail page.
5.  **Fetch Full Content (If Needed):** For each notification, if the full text is not in the initial JSON, navigate to the detail page URL using `page.goto()` and extract the content from the selectors identified in section 2.
6.  **Avoid Being Blocked:**
    - Use a realistic User-Agent string.
    - Implement delays between requests.
    - Handle potential errors and retries gracefully.
    - Close the browser instance after the scraping session is complete.

This strategy avoids the fragility of relying on CSS selectors for the main list and leverages the clean data provided by the site's own API.
