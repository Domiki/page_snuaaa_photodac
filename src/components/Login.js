"use client";

import React, { useState } from "react";
import styles from "../styles/App.module.css";

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState("nameCheck");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studentPageId, setStudentPageId] = useState(null);

  // 1. GET으로 이름 유효성 검사
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth?name=${encodeURIComponent(name)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStudentPageId(data.pageId);
      setStep(data.hasPassword ? "pwLogin" : "pwSetup");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. PATCH로 비밀번호 설정
  const handlePasswordSetup = async (e) => {
    e.preventDefault();
    if (password.length !== 3 || !/^\d+$/.test(password)) {
      alert("비밀번호는 숫자 3자리여야 합니다.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: studentPageId,
          password,
        }),
      });
      if (!res.ok) throw new Error("비밀번호 설정에 실패했습니다.");

      const data = await res.json();
      onLoginSuccess(data.student);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. POST로 로그인
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onLoginSuccess(data.student);
    } catch (error) {
      alert(error.message || "로그인에 실패했습니다.");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>2025 사진 DAC 로그인</h1>

      {step === "nameCheck" && (
        <form onSubmit={handleNameSubmit}>
          <label htmlFor="student-name" className={styles.label}>
            이름
          </label>
          <input
            type="text"
            id="student-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="이름을 입력하세요"
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "확인 중..." : "확인"}
          </button>
        </form>
      )}

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      {step === "pwSetup" && (
        <div className={styles.formSection}>
          <p>
            비밀번호를 처음 설정합니다. 사용할 숫자 3자리를 입력하세요.
            <br />
            민감한 개인정보는 지양해주시고, 설정한 비밀번호를 꼭 기억해주세요.
          </p>
          <form onSubmit={handlePasswordSetup}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputMode="numeric"
              pattern="\d{3}"
              maxLength="3"
              className={`${styles.input} ${styles.passwordInput}`}
              placeholder="•••"
              required
              autoFocus
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.button} ${styles.success}`}
            >
              {isLoading ? "설정 중..." : "설정 및 로그인"}
            </button>
          </form>
        </div>
      )}

      {step === "pwLogin" && (
        <div className={styles.formSection}>
          <p>설정된 비밀번호를 입력하세요.</p>
          <form onSubmit={handlePasswordLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputMode="numeric"
              pattern="\d{3}"
              maxLength="3"
              className={`${styles.input} ${styles.passwordInput}`}
              placeholder="•••"
              required
              autoFocus
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
