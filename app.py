from bottle import Bottle, template

app = Bottle()

@app.route('/')
def hello():
    return '''Hi'''

@app.route('/<user>/stopwatch')
def stopwatch(user):
    return template('stopwatch.html', name=user)

app.run(host='localhost', port=8080, debug=True)