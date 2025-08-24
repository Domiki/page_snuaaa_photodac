import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

// Notion 클라이언트 초기화
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.DATABASE_ID;

// Notion에서 이름으로 학생을 찾는 헬퍼 함수
async function queryStudentFromNotion(name) {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: "이름",
      rich_text: {
        equals: name,
      },
    },
  });
  return response.results.length > 0 ? response.results[0] : null;
}

// 학생 정보를 클라이언트에 안전하게 보낼 수 있는 형태로 변환하는 함수
function getSafeStudent(studentPage) {
  if (!studentPage) return null;
  return {
    id: studentPage.id, // Notion page ID를 학생의 고유 ID로 사용
    name: studentPage.properties["이름"].title[0]?.plain_text || "",
  };
}

// 1. 학생 이름 유효성 검사
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { message: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const studentPage = await queryStudentFromNotion(name);

    if (studentPage) {
      const passwordField =
        studentPage.properties["비밀번호"].rich_text[0]?.plain_text;
      return NextResponse.json({
        exists: true,
        hasPassword: !!passwordField, // 비밀번호 필드가 비어있지 않으면 true
        pageId: studentPage.id, // 비밀번호 설정/수정을 위해 pageId 전달
      });
    } else {
      return NextResponse.json(
        { message: "수강자 명단에 없습니다." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 2. 로그인 (비밀번호 확인)
export async function POST(request) {
  try {
    const { name, password } = await request.json();
    const studentPage = await queryStudentFromNotion(name);

    if (studentPage) {
      const storedPassword =
        studentPage.properties["비밀번호"].rich_text[0]?.plain_text;
      if (storedPassword && storedPassword === password) {
        return NextResponse.json({ student: getSafeStudent(studentPage) });
      } else {
        // 비밀번호 불일치
        return NextResponse.json(
          { message: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "수강자 명단에 없습니다." },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 3. 비밀번호 설정
export async function PATCH(request) {
  try {
    const { pageId, password } = await request.json();
    if (!pageId || !password) {
      return NextResponse.json(
        { message: "필요한 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // Notion 페이지의 속성을 업데이트
    await notion.pages.update({
      page_id: pageId,
      properties: {
        비밀번호: {
          rich_text: [
            {
              type: "text",
              text: {
                content: password,
              },
            },
          ],
        },
      },
    });

    // 업데이트 후, 로그인 처리를 위해 해당 학생 정보를 다시 조회해서 반환
    const updatedStudentPage = await notion.pages.retrieve({ page_id: pageId });

    return NextResponse.json({ student: getSafeStudent(updatedStudentPage) });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
