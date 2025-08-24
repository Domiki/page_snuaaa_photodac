// app/api/files/route.js

import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const filesNotion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * 클라이언트로부터 파일을 받아 Notion에 임시 업로드하고,
 * 그 파일의 고유 ID를 반환합니다.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "파일이 존재하지 않습니다." },
        { status: 400 }
      );
    }

    // 1단계: Notion에 파일을 올릴 수 있는 임시 공간(URL) 생성 요청
    const createUploadResponse = await fetch(
      "https://api.notion.com/v1/file_uploads",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({}),
      }
    );

    if (!createUploadResponse.ok) {
      throw new Error("Notion 업로드 공간 생성에 실패했습니다.");
    }
    const uploadData = await createUploadResponse.json();
    const uploadUrl = uploadData.upload_url;

    // 2단계: 발급받은 임시 URL에 파일 데이터 전송
    const sendFileResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
      },
      body: formData,
    });

    if (!sendFileResponse.ok) {
      throw new Error("Notion에 파일을 전송하는 데 실패했습니다.");
    }
    const sentFileData = await sendFileResponse.json();

    return NextResponse.json({
      fileId: sentFileData.id,
    });
  } catch (error) {
    console.error("File Upload POST Error:", error);
    return NextResponse.json(
      { message: error.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 임시 업로드된 파일의 ID를 받아, 특정 학생(페이지)의
 * 과제 속성에 최종적으로 연결합니다.
 */
export async function PATCH(request) {
  try {
    const { pageId, assignmentName, fileId, fileName } = await request.json();
    if (!pageId || !assignmentName || !fileId || !fileName) {
      return NextResponse.json(
        { message: "필요한 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    await filesNotion.pages.update({
      page_id: pageId,
      properties: {
        [assignmentName]: {
          files: [
            {
              name: fileName,
              type: "file_upload",
              file_upload: { id: fileId },
            },
          ],
        },
      },
    });

    return NextResponse.json({ message: "파일이 성공적으로 연결되었습니다." });
  } catch (error) {
    console.error("File Link PATCH Error:", error);
    return NextResponse.json(
      { message: "파일 연결 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
