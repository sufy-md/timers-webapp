# timers-webapp

A simple stopwatch-based time tracker that allows users to log time into custom categories.

## Features
- **Local-first** The master branch is merged from `authless` -- runs on any machine.
- **Limited Nesting** Doesn't suffer the decision fatigue usual for productivity tools.
- **Clean, iterable code** (as much as possible) -- customise it to your liking!

## Setup and running
1. Clone the repo
    ```bash
    git clone https://www.github.com/sufy-md/timers-webapp.git
    cd timers-webapp
    ```
1. Install dependencies
    ```bash
    pip install -r requirements.txt
    ```
1. Initialize the database
    ```bash
    cd db
    py init_db.py
    cd ..
    ```
1. Run the app
    ```bash
    py app.py
    ```
1. Open http://localhost:8080

## Usage
- Click anywhere to start/stop the watch
- Assign tracked time to a watch when stopped
- Create new categories and watches as needed.

## Tech Stack
- **Backend** Python, SQLite, Beaker
- **Frontend** HTML, CSS, JS
- **Auth** Bcrypt (on branch wauth; CSS not up-to-date.)

---

This repository and its contents are available under the MIT License.