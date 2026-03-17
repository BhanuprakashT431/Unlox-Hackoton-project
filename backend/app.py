from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)

# ✅ CORS FIX
CORS(app, origins=["http://localhost:5173"])

# DB CONFIG
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campusflow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# =========================
# MODEL
# =========================
class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default="pending")
    priority = db.Column(db.String(50), default="medium")

# INIT DB
with app.app_context():
    db.create_all()

# =========================
# HOME
# =========================
@app.route('/')
def home():
    return "CampusFlow Backend Running 🚀"

# =========================
# GET TASKS
# =========================
@app.route('/tasks')
def get_tasks():
    try:
        tasks = Assignment.query.all()

        result = []
        for t in tasks:
            result.append({
                "id": t.id,
                "title": t.title,
                "due_date": t.due_date,
                "status": t.status,
                "priority": t.priority
            })

        return jsonify(result)

    except Exception as e:
        print("TASK ERROR:", str(e))
        return jsonify([])  # ALWAYS ARRAY

# =========================
# STATS
# =========================
@app.route('/stats')
def stats():
    try:
        tasks = Assignment.query.all()

        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        pending = sum(1 for t in tasks if t.status == "pending")

        return jsonify({
            "total": total,
            "completed": completed,
            "pending": pending
        })

    except Exception as e:
        print("STATS ERROR:", str(e))
        return jsonify({
            "total": 0,
            "completed": 0,
            "pending": 0
        })
@app.route('/complete/<int:id>', methods=['PUT'])
def complete_task(id):
    try:
        task = Assignment.query.get(id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        task.status = "completed"
        db.session.commit()

        return jsonify({"msg": "Task completed"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# ADD TASK
# =========================
@app.route('/add', methods=['POST'])
def add_task():
    try:
        data = request.get_json()

        title = data.get("title")
        due_date = data.get("due_date")

        if not title or not due_date:
            return jsonify({"error": "Missing data"}), 400

        task = Assignment(
            title=title,
            due_date=due_date,
            priority=data.get("priority", "medium")
        )

        db.session.add(task)
        db.session.commit()

        return jsonify({"msg": "Task added"})

    except Exception as e:
        print("ADD ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)