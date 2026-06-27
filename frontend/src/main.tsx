import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="intro">
          <p className="eyebrow">Emotion Music Box</p>
          <h1>情绪音乐盒</h1>
          <p>
            输入当下心情，生成专属情绪音乐卡、音乐参数和动态可视化。
          </p>
        </div>
        <div className="music-box" aria-label="情绪音乐盒预览">
          <div className="disc" />
          <div className="wave">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
