from bottle import Bottle, redirect, request, response, run, static_file, template
from beaker.middleware import SessionMiddleware
from db.sql_helper import helper

import json
import os
import random

USER = None
def read_config():
    global USER
    with open('config.json', 'r') as f:
        config = json.load(f)
        USER_ = config.get('user')
        if USER_: USER = USER_
read_config()

BACKGROUNDS = [
    "https://images.unsplash.com/photo-1693925648059-431bc27aa059?q=80&w=6240&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1692784558638-f3a38bbb21d9?q=80&w=3024&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1742943892614-dfe67381c341?q=80&w=7440&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504253492562-cbc4dc540fcb?q=80&w=3000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1759298928528-68604ad099f5?q=80&w=7008&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1729932989171-c5c1a0bdc86d?q=80&w=2746&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1603950227760-e609ce8e15b4?q=80&w=3000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472173148041-00294f0814a2?q=80&w=5713&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503332132010-d1b77a049ddd?q=80&w=4858&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1622254835298-bc94b943bbd4?q=80&w=4298&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=4592&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516797045820-6edca89b2830?q=80&w=2448&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=4096&auto=format&fit=crop"
]

# LOGIN_BACKGROUND = "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=4096&auto=format&fit=crop"

os.environ['BEAKER_SESSION'] = '1'

session_opts = {
    'session.type': 'file',
    'session.auto': True,
    'session.cookie_expires': True,
    'session.data_dir': './sessions'
}

app = Bottle()
session_app = SessionMiddleware(app, session_opts)

@app.route('/')
def hello():
    return redirect('/stopwatch')

@app.route('/static/<file>')
def serve_static(file):
    return static_file(file, root='./static')

# @app.route('/signup', method=['POST', 'GET'])
# def signup():
#     if 'user' in request.environ.get('beaker.session'):
#         return redirect('/stopwatch')

#     if request.method == 'POST':
#         username = request.forms.get('username')
#         password = request.forms.get('password')

#         status = auth_helper(username, password).signup()
#         if (not status):
#             return template("signup.html", display='flex', background=LOGIN_BACKGROUND)
        
#         return redirect('/login')

#     return template("signup.html", display='none', background=LOGIN_BACKGROUND)

# @app.route('/login', method=['POST', 'GET'])
# def login():
#     # print("keys: ", request.environ.keys())
#     session = request.environ.get('beaker.session')

#     if 'user' in session:
#         return redirect('/stopwatch')

#     if request.method == 'POST':
#         username = request.forms.get('username')
#         password = request.forms.get('password')

#         status = auth_helper(username, password).login()
#         if (not status):
#             return template("login.html", display='flex', background=LOGIN_BACKGROUND)
        
#         session['user'] = username
#         session['user_id'] = status
#         session['background'] = random.choice(BACKGROUNDS)
#         session.save()
#         return redirect('/stopwatch')

#     return template("login.html", display='none', background=LOGIN_BACKGROUND)

@app.route('/stopwatch')
def stopwatch():
    session = request.environ.get('beaker.session')
    # if not session or 'user' not in session:
    #     return redirect('/login')
    
    # Ensure background is set (for old sessions)
    if 'background' not in session:
        session['background'] = random.choice(BACKGROUNDS)
        session.save()
    
    return template('stopwatch.html', user=USER, background=session['background'])

@app.route('/get-categories', method=['POST'])
def get_categories():
    session = request.environ.get('beaker.session')
    # user_id = session['user_id']

    categories = helper().fetch_categories()
    response.content_type = 'application/json'
    return json.dumps(categories)

@app.route('/create-watch', method=['POST'])
def create_watch():
    session = request.environ.get('beaker.session')
    # user_id = session['user_id']

    data = request.json
    watch_name = data.get('name').strip()
    cat = data.get('category_id')
    subcat = data.get('subcategory_id') or None

    parent_id = subcat if subcat else cat
    create = helper().create_watch(parent_id, watch_name)

    if (not create):
        response.status = 409
        return "Error - Duplicate"
    
    response.status = 201
    return "Success"

@app.route('/create-category', method=['POST'])
def create_category():
    # user_id = request.environ.get('beaker.session')['user_id']

    data = request.json
    cat_name = data.get('name').strip()
    parent = data.get('parent')
    parent = parent if parent != "null" else None

    create = helper().create_category(parent, cat_name)

    response.status = 201
    return "Success"

@app.route('/save-time', method=['POST'])
def save_time():
    # user_id = request.environ.get('beaker.session')['user_id']

    data = request.json
    watch_id = data.get('watch')
    time = int(data.get('time'))

    add_time = helper().add_time(watch_id, time)

    if (add_time):
        response.status = 201
        return "Success"
    
    response.status = 500
    return "Failed"

@app.route('/dashboard')
def dashboard():
    session = request.environ.get('beaker.session')
    # if not session or 'user' not in session:
    #     return redirect('/login')
    
    # Ensure background is set (for old sessions)
    if 'background' not in session:
        session['background'] = random.choice(BACKGROUNDS)
        session.save()
    
    return template('dashboard.html', user=USER, background=session['background'])

# @app.route('/logout')
# def logout():
#     session = request.environ.get('beaker.session')
#     session.delete()
#     session.invalidate()

#     return redirect('/')

run(session_app, host='localhost', port=8080, debug=True)