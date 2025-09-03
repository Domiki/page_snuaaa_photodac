"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/App.module.css";

const scheduleData = [
  {
    date: "09/03",
    topic: "오리엔테이션, 천체사진촬영법 기본",
    group1: "-",
    group2: "-",
  },
  {
    date: "09/10",
    topic: "노출의 3요소, 카메라 바디",
    group1: "카메라 사용법",
    group2: "",
  },
  { date: "09/17", topic: "카메라 렌즈", group1: "", group2: "카메라 사용법" },
  {
    date: "09/24",
    topic: "점상사진, 일주사진",
    group1: "고정촬영 실습",
    group2: "",
  },
  {
    date: "10/01",
    topic: "고정사진 후보정",
    group1: "",
    group2: "고정촬영 실습",
  },
  { date: "10/08", topic: "-", group1: "-", group2: "-" }, // 휴강
  { date: "10/15", topic: "가이드촬영", group1: "가이드촬영 실습", group2: "" },
  {
    date: "10/22",
    topic: "망원경 가이드촬영",
    group1: "",
    group2: "가이드촬영 실습",
  },
  { date: "10/29", topic: "-", group1: "-", group2: "-" }, // 휴강
  {
    date: "11/05",
    topic: "망원경 가이드촬영",
    group1: "망원경 가이드촬영 실습 1",
    group2: "",
  },
  {
    date: "11/12",
    topic: "가이드사진 후보정",
    group1: "",
    group2: "망원경 가이드촬영 실습 1",
  },
  {
    date: "11/19",
    topic: "태양계 촬영",
    group1: "망원경 가이드촬영 실습 2",
    group2: "",
  },
  {
    date: "11/26",
    topic: "기말고사",
    group1: "-",
    group2: "망원경 가이드촬영 실습 2",
  },
];

export default function Schedule() {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(-1);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = 2025;
    let activeIndex = -1;

    for (let i = 0; i < scheduleData.length; i++) {
      const item = scheduleData[i];
      if (!item.date) continue;

      const [month, day] = item.date.split("/").map(Number);
      const scheduleDate = new Date(year, month - 1, day);

      const nextScheduleDate =
        i + 1 < scheduleData.length && scheduleData[i + 1].date
          ? new Date(
              year,
              ...scheduleData[i + 1].date
                .split("/")
                .map(Number)
                .map((n, idx) => (idx === 0 ? n - 1 : n))
            )
          : null;

      if (
        today >= scheduleDate &&
        (!nextScheduleDate || today < nextScheduleDate)
      ) {
        activeIndex = i;
        break;
      }
    }
    if (
      activeIndex === -1 &&
      scheduleData.length > 0 &&
      today >
        new Date(
          year,
          ...scheduleData[scheduleData.length - 1].date
            .split("/")
            .map(Number)
            .map((n, i) => (i === 0 ? n - 1 : n))
        )
    ) {
      activeIndex = scheduleData.length - 1;
    }
    setCurrentWeekIndex(activeIndex);
  }, []);

  return (
    <div className={`${styles.card} ${styles.cardMarginBottom}`}>
      <h2 className={styles.subtitle}>주차별 강의 목록</h2>
      <div className={styles.tableContainer}>
        <table className={styles.scheduleTable}>
          <thead>
            <tr>
              <th>날짜</th>
              <th>수업내용</th>
              <th>실습 (Group #1)</th>
              <th>실습 (Group #2)</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((item, index) => (
              <tr
                key={index}
                className={index === currentWeekIndex ? styles.currentWeek : ""}
              >
                <td>{item.date}</td>
                <td>{item.topic}</td>
                <td>{item.group1}</td>
                <td>{item.group2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
