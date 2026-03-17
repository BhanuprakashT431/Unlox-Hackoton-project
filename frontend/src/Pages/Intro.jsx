import { useNavigate } from "react-router-dom";

export default function Intro() {
  const nav = useNavigate();

  return (
    <div style={{ padding: 40 }}>

      <section>
        <h1>🚀 CampusFlow</h1>
        <p>Manage your academic life effortlessly</p>
      </section>

      <section>
        <h2>📅 Track Deadlines</h2>
        <p>Never miss assignments again</p>
      </section>

      <section>
        <h2>📊 Analytics</h2>
        <p>Visual insights for productivity</p>
      </section>

      <section>
        <h2>🤖 Smart AI</h2>
        <p>Get intelligent suggestions</p>
      </section>

      <button onClick={() => nav("/dashboard")}>
        Enter Dashboard →
      </button>

    </div>
  );
}