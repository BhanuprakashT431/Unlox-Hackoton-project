import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Intro.css";

export default function Intro() {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const fullText = "Smart Student Productivity Platform 🚀";
  useEffect(() => {
  const glow = document.querySelector(".cursor-glow");

  const move = (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  };

  window.addEventListener("mousemove", move);

  return () => window.removeEventListener("mousemove", move);
}, []);

  // Typewriter
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Voice Welcome
  useEffect(() => {
    const speak = () => {
      const msg = new SpeechSynthesisUtterance(
        "Welcome to Campus Flow"
      );
      msg.rate = 1;
      window.speechSynthesis.speak(msg);
    };
    setTimeout(speak, 1500);
  }, []);

  return (
    <div className="intro-container">

      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Mouse Glow */}
      <div className="cursor-glow"></div>

      {/* Content */}
      <motion.div
        className="intro-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="intro-title"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          CampusFlow
        </motion.h1>

        <p className="intro-subtitle">{text}</p>

        <motion.button
          className="intro-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard")}
        >
          Get Started →
        </motion.button>
      </motion.div>

      {/* AI Popup */}
      <div className="ai-popup">
        🤖 AI Ready to Assist You
      </div>
    </div>
  );
}