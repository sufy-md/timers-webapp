from bottle import Bottle, static_file, template

app = Bottle()

@app.route('/')
def hello():
    return '''Hi'''

@app.route('/static/<file>')
def serve_static(file):
    return static_file(file, root='./static')

@app.route('/<user>/stopwatch')
def stopwatch(user):
    return template('stopwatch.html', name=user)

app.run(host='localhost', port=8080, debug=True)