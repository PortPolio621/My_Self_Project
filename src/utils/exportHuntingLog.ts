import { Platform } from "react-native";
import * as XLSX from "xlsx";

import { HuntingLogEntry } from "@/types";

type ExcelRow = Record<string, string | number>;

interface HuntingLogSummary {
  totalSolErdaSoldCount: number;
  totalSolErdaSoldIncome: number;
}

function buildWorkbookBytes(
  huntingLog: HuntingLogEntry[],
  summary: HuntingLogSummary
): Uint8Array {
  const rows: ExcelRow[] = huntingLog.map((entry) => ({
    날짜: entry.date,
    "사냥 수입(메소)": Math.round(entry.totalMeso),
  }));

  const totalMeso = huntingLog.reduce((sum, entry) => sum + entry.totalMeso, 0);

  rows.push(
    { 날짜: "", "사냥 수입(메소)": "" },
    { 날짜: "누적 총 수입(메소)", "사냥 수입(메소)": Math.round(totalMeso) },
    { 날짜: "판매한 솔 에르다 조각(개)", "사냥 수입(메소)": summary.totalSolErdaSoldCount },
    {
      날짜: "솔 에르다 판매 순수익(메소)",
      "사냥 수입(메소)": Math.round(summary.totalSolErdaSoldIncome),
    }
  );

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "가계부");

  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as number[];
  return new Uint8Array(bytes);
}

/** 가계부 기록(+ 누적 솔 에르다 통계)을 .xlsx 파일로 내보낸다. 웹은 바로 다운로드, 앱은 공유 시트를 연다 */
export async function exportHuntingLogToExcel(
  huntingLog: HuntingLogEntry[],
  summary: HuntingLogSummary
): Promise<void> {
  const bytes = buildWorkbookBytes(huntingLog, summary);
  const fileName = `메소플래너_가계부_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  if (Platform.OS === "web") {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const { File, Paths } = await import("expo-file-system");
  const Sharing = await import("expo-sharing");

  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(bytes);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType,
      dialogTitle: "메소 플래너 가계부 내보내기",
    });
  }
}
