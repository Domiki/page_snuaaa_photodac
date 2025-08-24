"use client";

import React, { useRef, useState } from "react";
import styles from "../styles/App.module.css";

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString("ko-KR");
};

export default function AssignmentItem({
  assignment,
  studentId,
  onUploadSuccess,
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("PDF 파일만 업로드할 수 있습니다.");
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    try {
      // Step 1, 2: 파일 업로드 URL을 생성하고 파일 업로드
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("파일을 제출하지 못했습니다.");

      const { fileId } = await res.json();

      // Step3: 학생 페이지에 업로드한 파일 붙이기
      const completeRes = await fetch("/api/files", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId: studentId,
          assignmentName: assignment.name,
          fileId,
          fileName: file.name,
        }),
      });

      if (!completeRes.ok) throw new Error("파일을 업로드하지 못했습니다.");

      alert("파일이 성공적으로 제출되었습니다.");
      onUploadSuccess();
    } catch (error) {
      console.error("File upload error:", error);
      alert(`오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const buttonText = isUploading ? "업로드 중..." : "과제 제출";
  const modifyButtonText = isUploading ? "업로드 중..." : "수정하기";

  let submissionDetails;
  if (assignment.file) {
    submissionDetails = (
      <div className={styles.submissionStatus}>
        <p className={styles.statusSuccess}>
          제출 완료:{" "}
          <a
            href={assignment.file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkButton}
          >
            {assignment.file.name}
          </a>
        </p>
        <p>제출일: {formatDate(assignment.submittedAt)}</p>
        <button
          onClick={handleButtonClick}
          className={`${styles.button} ${styles.small}`}
          disabled={isUploading}
        >
          {modifyButtonText}
        </button>
      </div>
    );
  } else {
    submissionDetails = (
      <div className={styles.submissionStatus}>
        <p className={styles.statusDanger}>미제출</p>
        <button
          onClick={handleButtonClick}
          className={`${styles.button} ${styles.small}`}
          disabled={isUploading}
        >
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.listItem}>
      <div className={styles.assignmentDetails}>
        <p className={styles.assignmentName}>{assignment.name}</p>
        {submissionDetails}
        <input
          type="file"
          ref={fileInputRef}
          className={styles.hiddenInput}
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
      <div className={styles.assignmentScore}>
        <span>점수</span>
        <span>{assignment.score ?? "-"}</span>
      </div>
    </div>
  );
}
