# timers-webapp

A simple stopwatch-based time tracker that allows users to log time into custom categories.

## Features
- **Stopwatch-based functionality** Start / Stop and centisecond accuracy
- **User auth** Secure login / signup and session storage
- **Nested Categorisation** Maximum depth of 2 keeps things simple
- **User Dashboard** To view recorded time neatly
- **Data Persistence** with SQLite

## Setup
1. Clone the repo:
    ```bash
    git clone https://www.github.com/sufy-md/timers-webapp.git
    cd timers-webapp
    ```
1. Install dependencies
    ```bash
    pip install -r requirements.txt
1. Run the app
    ```bash
    py app.py
1. Open http://localhost:8080

## Usage
- Click anywhere to start/stop the watch
- Assign tracked time to a watch when stopped
- Create new categories and watches as needed.
- Make sure to run the following
    ```bash
    cd db
    py init_db.py
    cd ..
    ```
    before using the app. This initialises the main database required for running the app.

## Tech Stack
- **Backend** Python, SQLite, Beaker
- **Frontend** HTML, CSS, JS
- **Auth** Bcrypt

## Future Improvements
- UI / UX improvements
- Watch / Category Deletion
- API for external integrations

---

This repository and its contents are available under the MIT License.