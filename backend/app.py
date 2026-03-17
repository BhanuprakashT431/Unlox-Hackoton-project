from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

# ✅ Enable CORS (VERY IMPORTANT for React)
CORS(app)

# ✅ Database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///campusflow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ✅ MODEL
class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.String(100))
    description = db.Column(db.String(500))
    status = db.Column(db.String(50), default="pending")
    priority = db.Column(db.String(50), default="medium")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# ✅ CREATE DB
with app.app_context():
    db.create_all()

# 🚀 ADD TASK
@app.route('/add', methods=['POST'])
def add_task():
    try:
        data = request.get_json()

        if not data or not data.get("title"):
            return jsonify({"error": "Title is required"}), 400

        task = Assignment(
            title=data.get('title'),
            due_date=data.get('due_date', ''),
            description=data.get('description', ''),
            priority=data.get('priority', 'medium')
        )

        db.session.add(task)
        db.session.commit()

        return jsonify({"msg": "Task added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🚀 GET TASKS
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Assignment.query.order_by(Assignment.id.desc()).all()

        return jsonify([
            {
                "id": t.id,
                "title": t.title,
                "due_date": t.due_date,
                "status": t.status,
                "priority": t.priority,
                "created_at": t.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for t in tasks
        ])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🚀 COMPLETE TASK
@app.route('/complete/<int:id>', methods=['PUT'])
def complete_task(id):
    try:
        task = Assignment.query.get(id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        task.status = "completed"
        db.session.commit()

        return jsonify({"msg": "Task marked as completed"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🚀 DELETE TASK
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_task(id):
    try:
        task = Assignment.query.get(id)

        if not task:
            return jsonify({"error": "Task not found"}), 404

        db.session.delete(task)
        db.session.commit()

        return jsonify({"msg": "Task deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🤖 AI SUGGESTION
@app.route('/ai', methods=['GET'])
def ai():
    try:
        tasks = Assignment.query.all()
        pending = [t for t in tasks if t.status == "pending"]

        if len(tasks) == 0:
            return jsonify({"msg": "Start by adding tasks 🚀"})

        if len(pending) > 5:
            return jsonify({"msg": "Too many pending tasks 😬 Focus on high priority first!"})

        if any(t.priority == "high" and t.status == "pending" for t in tasks):
            return jsonify({"msg": "You have high priority tasks pending ⚡ Do them first!"})

        return jsonify({"msg": "You're doing great 💪 Keep going!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🚀 RUN SERVER
if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)