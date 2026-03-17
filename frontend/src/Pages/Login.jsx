import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const nav = useNavigate();

  return (
    <div className="login">
      <div className="overlay">
        <h1>CampusFlow</h1>
        <p>Smart Student Productivity Platform</p>
        <button onClick={() => nav("/intro")}>
          Get Started →
        </button>
      </div>
    </div>
  );
}