"use client";

import React, { useState, useEffect, useCallback } from "react";
import AssignmentItem from "./AssignmentItem";
import styles from "../styles/App.module.css";

export default function Dashboard({ user }) {
  const [group, setGroup] = useState(0);
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [practiceSessions, setPracticeSessions] = useState([]);
  const [finalExamScore, setFinalExamScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const PracticeDates = [
    ["", "", "", "", ""],
    ["(09/03)", "(09/17)", "(10/01)", "(10/22)", "(11/12)"],
    ["(09/10)", "(09/24)", "(10/15)", "(11/05)", "(11/19)"],
  ];
  const PracticeTitles = [
    "카메라 사용법",
    "고정촬영 실습",
    "가이드촬영 실습",
    "망원경 가이드촬영 실습 1",
    "망원경 가이드촬영 실습 2",
  ];

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/data?studentId=${user.id}`);
      if (!res.ok) throw new Error("데이터를 불러오는 데 실패했습니다.");

      const data = await res.json();
      setGroup(data.group);
      setAttendance(data.attendance);
      setAssignments(data.assignments);
      setPracticeSessions(data.practiceSessions);
      setFinalExamScore(data.finalExamScore);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div className={styles.loading}>데이터를 불러오는 중...</div>;
  }

  return (
    <div>
      <header className={styles.dashboardHeader}>
        <h1 className={styles.InfoName}>{user.name}</h1>
        <h2 className={styles.InfoGroup}>
          그룹: {group == null ? "미정" : group}
        </h2>
      </header>
      <div className={`${styles.card} ${styles.cardMarginBottom}`}>
        <h2 className={styles.subtitle}>수업 별 출석 현황</h2>
        <div className={styles.list}>
          {attendance.length > 0 ? (
            attendance.map((att, index) => {
              const statusStyle =
                att.status === "출석"
                  ? styles.statusSuccess
                  : att.status === "결석"
                  ? styles.statusDanger
                  : "";
              return (
                <div key={index} className={styles.listItem}>
                  <span>{att.date}</span>
                  <span className={`${styles.status} ${statusStyle}`}>
                    {att.status === "미정" ? "-" : att.status}
                  </span>
                </div>
              );
            })
          ) : (
            <p>출석 기록이 없습니다.</p>
          )}
        </div>
      </div>
      <div className={`${styles.card} ${styles.cardMarginBottom}`}>
        <h2 className={styles.subtitle}>과제 제출 현황</h2>
        <div className={styles.list}>
          {assignments.length > 0 ? (
            assignments.map((assign) => (
              <AssignmentItem
                key={assign.name}
                assignment={assign}
                studentId={user.id}
                onUploadSuccess={fetchData}
              />
            ))
          ) : (
            <p>해당하는 과제가 없습니다.</p>
          )}
        </div>
      </div>
      <div className={`${styles.card} ${styles.cardMarginBottom}`}>
        <h2 className={styles.subtitle}>실습 현황</h2>
        <div className={styles.list}>
          {practiceSessions.length > 0 ? (
            practiceSessions.map((session, index) => {
              const statusStyle =
                session.status === "수행"
                  ? styles.statusSuccess
                  : session.status === "미수행"
                  ? styles.statusDanger
                  : "";
              return (
                <div key={index} className={styles.listItem}>
                  <span>
                    {session.name +
                      " " +
                      PracticeDates[Number(group)][index] +
                      " - " +
                      PracticeTitles[index]}
                  </span>
                  <span className={`${styles.status} ${statusStyle}`}>
                    {session.status === "미정" ? "-" : session.status}
                  </span>
                </div>
              );
            })
          ) : (
            <p>실습 기록이 없습니다.</p>
          )}
        </div>
      </div>
      {finalExamScore !== null && (
        <div className={styles.card}>
          <h2 className={styles.subtitle}>기말고사 점수</h2>
          <div className={styles.finalScore}>
            <span>{finalExamScore}</span> 점
          </div>
        </div>
      )}
    </div>
  );
}
