import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

// Notion 클라이언트는 한 번만 초기화합니다.
const dataNotion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId"); // 이 ID는 학생의 Notion Page ID

  if (!studentId) {
    return NextResponse.json(
      { message: "학생 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    // 학생 페이지의 모든 속성 정보를 가져옵니다.
    const page = await dataNotion.pages.retrieve({ page_id: studentId });
    const properties = page.properties;

    const attendance = [];
    const assignmentsData = {};
    const practiceSessions = [];
    let group = null;
    let finalExamScore = null;

    // 모든 속성을 순회하며 데이터 처리
    for (const propName in properties) {
      const propValue = properties[propName];

      // 1. 그룹 처리
      if (propName === "그룹" && propValue.type === "number") {
        group = propValue.number;
      }

      // 2. 출석 데이터 처리 (속성 이름이 'MM/DD'로 시작하고 타입이 'status'인 경우)
      if (/^\d{2}\/\d{2}/.test(propName) && propValue.type === "status") {
        attendance.push({
          date: propName,
          status: propValue.status?.name || "기록 없음",
        });
      }

      // 3. 과제 데이터 처리
      if (propName.startsWith("Homework") && propValue.type === "files") {
        const homeworkName = propName;
        if (!assignmentsData[homeworkName])
          assignmentsData[homeworkName] = { name: homeworkName };
        if (propValue.files.length > 0) {
          const file = propValue.files[0];
          assignmentsData[homeworkName].file = {
            name: file.name,
            url: file.file?.url,
          };
          assignmentsData[homeworkName].submittedAt = page.last_edited_time;
        }
      }
      if (
        propName.endsWith("점수") &&
        propValue.type === "number" &&
        !propName.includes("기말고사")
      ) {
        const homeworkName = propName.replace(" 점수", "").trim();
        if (!assignmentsData[homeworkName])
          assignmentsData[homeworkName] = { name: homeworkName };
        assignmentsData[homeworkName].score = propValue.number;
      }

      // 4. 실습 데이터 처리
      if (propName.startsWith("실습") && propValue.type === "status") {
        practiceSessions.push({
          name: propName,
          status: propValue.status?.name || "기록 없음",
        });
      }

      // 5. 기말고사 점수 처리
      if (propName === "기말고사 점수" && propValue.type === "number") {
        finalExamScore = propValue.number;
      }
    }

    // 데이터 정렬
    attendance.sort((a, b) => a.date.localeCompare(b.date));
    practiceSessions.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    const assignments = Object.values(assignmentsData);
    assignments.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    return NextResponse.json({
      group,
      attendance,
      assignments,
      practiceSessions,
      finalExamScore,
    });
  } catch (error) {
    console.error("Data Fetch Error:", error);
    return NextResponse.json(
      { message: "데이터를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
