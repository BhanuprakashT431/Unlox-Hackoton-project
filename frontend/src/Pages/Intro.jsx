import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Intro.css"; 

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">

      {/* Glow Background */}
      <div className="glow"></div>

      <motion.div
        className="intro-content"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="intro-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          CampusFlow
        </motion.h1>

        <motion.p
          className="intro-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Organize. Track. Achieve. 🚀
        </motion.p>

        <motion.button
          className="intro-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard")}
        >
          Get Started →
        </motion.button>
      </motion.div>
    </div>
  );
}