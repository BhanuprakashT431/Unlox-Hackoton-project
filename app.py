from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campusflow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    due_date = db.Column(db.String(100))
    description = db.Column(db.String(500))
    status = db.Column(db.String(50), default="pending")
    priority = db.Column(db.String(50), default="medium")

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/add', methods=['POST'])
def add_task():
    data = request.get_json(force=True)

    task = Assignment(
        title=data['title'],
        due_date=data['due_date'],
        description=data['description'],
        priority=data['priority']
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"msg": "Added"})

@app.route('/tasks')
def get_tasks():
    tasks = Assignment.query.all()

    return jsonify([{
        "id": t.id,
        "title": t.title,
        "due_date": t.due_date,
        "status": t.status,
        "priority": t.priority
    } for t in tasks])

@app.route('/complete/<int:id>', methods=['PUT'])
def complete_task(id):
    t = Assignment.query.get(id)
    t.status = "completed"
    db.session.commit()
    return jsonify({"msg": "Done"})

@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_task(id):
    t = Assignment.query.get(id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"msg": "Deleted"})

@app.route('/ai')
def ai():
    tasks = Assignment.query.all()
    pending = [t for t in tasks if t.status == "pending"]

    if len(tasks) == 0:
        return jsonify({"msg": "Start by adding tasks 🚀"})

    if len(pending) > 5:
        return jsonify({"msg": "Too many pending tasks 😬 Focus!"})

    return jsonify({"msg": "You're doing great 💪"})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)