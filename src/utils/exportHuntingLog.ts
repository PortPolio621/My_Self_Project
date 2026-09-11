import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as XLSX from "xlsx";

import { HuntingLogEntry } from "@/types";

type ExcelRow = Record<string, string | number>;

interface HuntingLogSummary {
  totalSolErdaSoldCount: number;
  totalSolErdaSoldIncome: number;
}

const MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Android에서 한 번 선택한 저장 폴더(SAF) 권한을 기억해두는 키. 다음 내보내기부터는 다시 묻지 않는다 */
const ANDROID_SAF_DIRECTORY_URI_KEY = "meso-planner:export-directory-uri";

function buildWorkbook(huntingLog: HuntingLogEntry[], summary: HuntingLogSummary) {
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

  // 메소 수치 셀은 지수 표기(5.77E+08) 대신 천단위 구분 기호가 붙은 완전한 숫자로 보이도록
  // 명시적 표시 형식을 지정하고, 좁은 열 너비 때문에 잘려 보이지 않게 열 너비도 넓힌다.
  const range = XLSX.utils.decode_range(worksheet["!ref"] as string);
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
    const cell = worksheet[cellAddress];
    if (cell && cell.t === "n") {
      cell.z = "#,##0";
    }
  }
  worksheet["!cols"] = [{ wch: 14 }, { wch: 20 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "가계부");
  return workbook;
}

/**
 * Android: SAF(Storage Access Framework)로 선택한 폴더(보통 다운로드)에 바로 파일을 써서
 * 공유 시트 없이 "다운로드"에 가까운 경험을 준다. 폴더 권한은 최초 1회만 요청하고 기억해둔다.
 */
async function saveOnAndroid(baseFileName: string, base64Content: string): Promise<void> {
  const { StorageAccessFramework } = await import("expo-file-system/legacy");

  const writeIntoDirectory = (directoryUri: string) =>
    StorageAccessFramework.createFileAsync(directoryUri, baseFileName, MIME_TYPE).then(
      (fileUri) => StorageAccessFramework.writeAsStringAsync(fileUri, base64Content, {
        encoding: "base64",
      })
    );

  const savedDirectoryUri = await AsyncStorage.getItem(ANDROID_SAF_DIRECTORY_URI_KEY);
  if (savedDirectoryUri) {
    try {
      await writeIntoDirectory(savedDirectoryUri);
      return;
    } catch {
      // 저장해둔 폴더 권한이 취소/만료됐을 수 있으니 아래에서 다시 요청한다
      await AsyncStorage.removeItem(ANDROID_SAF_DIRECTORY_URI_KEY);
    }
  }

  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted) {
    throw new Error("저장할 폴더 접근 권한이 필요해요.");
  }
  await AsyncStorage.setItem(ANDROID_SAF_DIRECTORY_URI_KEY, permissions.directoryUri);
  await writeIntoDirectory(permissions.directoryUri);
}

/**
 * 가계부 기록(+ 누적 솔 에르다 통계)을 .xlsx로 내보낸다.
 * 웹은 브라우저 다운로드, 안드로이드는 선택한 폴더에 직접 저장(최초 1회만 폴더 선택),
 * iOS는 공유 시트를 통해 "파일에 저장"한다.
 */
export async function exportHuntingLogToExcel(
  huntingLog: HuntingLogEntry[],
  summary: HuntingLogSummary
): Promise<void> {
  const workbook = buildWorkbook(huntingLog, summary);
  const baseFileName = `메소플래너_가계부_${new Date().toISOString().slice(0, 10)}`;

  if (Platform.OS === "web") {
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as number[];
    const blob = new Blob([new Uint8Array(bytes)], { type: MIME_TYPE });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseFileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  if (Platform.OS === "android") {
    const base64 = XLSX.write(workbook, { bookType: "xlsx", type: "base64" }) as string;
    await saveOnAndroid(baseFileName, base64);
    return;
  }

  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as number[];
  const { File, Paths } = await import("expo-file-system");
  const Sharing = await import("expo-sharing");

  const file = new File(Paths.cache, `${baseFileName}.xlsx`);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(new Uint8Array(bytes));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: MIME_TYPE,
      dialogTitle: "메소 플래너 가계부 내보내기",
    });
  }
}
