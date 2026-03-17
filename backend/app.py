from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import requests

app = Flask(__name__)
CORS(app)  # ✅ FIX FRONTEND CONFLICT

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campusflow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

N8N_WEBHOOK_URL = "http://localhost:5678/webhook/add-assignment"

# 📦 MODEL
class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.String(100), nullable=True)  # ✅ OPTIONAL NOW
    description = db.Column(db.String(500))
    status = db.Column(db.String(50), default="pending")
    priority = db.Column(db.String(50), default="medium")
    phone = db.Column(db.String(20))

# 🏗 INIT DB
with app.app_context():
    db.create_all()

# 🏠 HOME
@app.route('/')
def home():
    return "CampusFlow Backend Running 🚀"

# 🔍 HEALTH
@app.route('/health')
def health():
    return jsonify({"status": "ok"})

# 🚀 ADD TASK (FIXED)
@app.route('/add', methods=['POST'])
def add_task():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON"}), 400

    title = data.get('title')
    due_date = data.get('due_date') or datetime.utcnow().isoformat()  # ✅ DEFAULT
    priority = data.get('priority', 'medium')
    phone = data.get('phone', '+916363330474')
    description = data.get('description', '')

    if not title:
        return jsonify({"error": "Title required"}), 400

    task = Assignment(
        title=title,
        due_date=due_date,
        description=description,
        priority=priority,
        phone=phone
    )

    db.session.add(task)
    db.session.commit()

    # 🔁 n8n CALL (SAFE)
    try:
        payload = {
            "title": title,
            "deadline": due_date,
            "phone": phone,
            "priority": priority,
            "task_id": task.id
        }
        requests.post(N8N_WEBHOOK_URL, json=payload, timeout=3)
    except:
        pass  # don't break app

    return jsonify({"msg": "Task added", "id": task.id})

# 📋 GET TASKS (FRONTEND SAFE)
@app.route('/tasks')
def tasks():
    data = Assignment.query.all()

    return jsonify([{
        "id": t.id,
        "title": t.title,
        "due_date": t.due_date,
        "status": t.status,
        "priority": t.priority
    } for t in data])

# 📊 STATS (🔥 REQUIRED FOR DASHBOARD)
@app.route('/stats')
def stats():
    total = Assignment.query.count()
    completed = Assignment.query.filter_by(status="completed").count()
    pending = Assignment.query.filter_by(status="pending").count()

    return jsonify({
        "total": total,
        "completed": completed,
        "pending": pending
    })

# ✅ COMPLETE TASK
@app.route('/complete/<int:id>', methods=['PUT'])
def complete(id):
    t = Assignment.query.get(id)
    if not t:
        return jsonify({"error": "Not found"}), 404

    t.status = "completed"
    db.session.commit()

    return jsonify({"msg": "Completed"})

# 🗑 DELETE
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete(id):
    t = Assignment.query.get(id)
    if not t:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(t)
    db.session.commit()

    return jsonify({"msg": "Deleted"})

# 🤖 AI (IMPROVED)
@app.route('/ai')
def ai():
    tasks = Assignment.query.all()
    pending = [t for t in tasks if t.status == "pending"]

    if not tasks:
        return jsonify({"msg": "Start adding tasks 🚀"})

    if len(pending) > 5:
        return jsonify({"msg": "Too many pending tasks 😬"})

    if any(t.priority == "high" for t in pending):
        return jsonify({"msg": "High priority tasks pending ⚡"})

    return jsonify({"msg": "You're doing great 💪"})

if __name__ == '__main__':
    app.run(debug=True)