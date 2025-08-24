"use client";

import React, { useState } from "react";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import styles from "../styles/App.module.css";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        {currentUser ? (
          <Dashboard user={currentUser} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </main>
  );
}
