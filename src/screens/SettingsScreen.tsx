import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { usePlannerStore } from "@/store/usePlannerStore";
import {
  SESSION_DURATION_LABELS,
  SessionDuration,
  useSettingsStore,
} from "@/store/useSettingsStore";
import { useThemeStore } from "@/store/useThemeStore";
import { ColorPalette, THEME_LABELS, THEME_NAMES, ThemeName, getColors } from "@/theme/colors";
import { useColors } from "@/theme/useColors";

const SESSION_DURATION_OPTIONS: SessionDuration[] = ["none", "3h", "6h", "forever"];

/** 아직 실제 결제(RevenueCat 등)가 연동되지 않아 시연용으로 쓰는 월 구독 가격 */
const PRO_PRICE_LABEL = "월 3,300원";

const PRIVACY_POLICY_URL = "https://claude.ai/artifact/7dEdsyGn2fah5qHJeusDF4";

/** 결제 진행 화면이 보여지는 시간(ms). 실제 결제가 없으니 연출용으로만 사용 */
const PROCESSING_DELAY_MS = 1400;

type CheckoutStep = "idle" | "confirm" | "processing" | "success";
type PaymentMethod = "card" | "kakaopay";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "신용·체크카드",
  kakaopay: "카카오페이",
};

interface MockCard {
  id: string;
  badgeText: string;
  badgeColor: string;
  label: string;
  sub: string;
}

/** 실제로 등록된 카드가 아니라, 결제 화면을 그럴듯하게 보여주기 위한 시연용 목록 */
const MOCK_CARDS: MockCard[] = [
  { id: "card1", badgeText: "신한", badgeColor: "#0046FF", label: "신한카드 체크", sub: "•••• •••• •••• 4821" },
  { id: "card2", badgeText: "KB", badgeColor: "#FFBC00", label: "국민카드 신용", sub: "•••• •••• •••• 7305" },
  { id: "card3", badgeText: "삼성", badgeColor: "#1428A0", label: "삼성카드 신용", sub: "•••• •••• •••• 1190" },
];

interface MockKakaoAccount {
  id: string;
  name: string;
  phone: string;
}

/** 실제로 연동된 계정이 아니라, 결제 화면을 그럴듯하게 보여주기 위한 시연용 목록 */
const MOCK_KAKAO_ACCOUNTS: MockKakaoAccount[] = [
  { id: "kakao1", name: "홍길동", phone: "010-****-1234" },
  { id: "kakao2", name: "김철수", phone: "010-****-5678" },
  { id: "kakao3", name: "이영희", phone: "010-****-9012" },
];

export function SettingsScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const sessionDuration = useSettingsStore((s) => s.sessionDuration);
  const setSessionDuration = useSettingsStore((s) => s.setSessionDuration);

  const isPro = usePlannerStore((s) => s.isPro);
  const setIsPro = usePlannerStore((s) => s.setIsPro);

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("idle");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [selectedCardId, setSelectedCardId] = useState(MOCK_CARDS[0].id);
  const [selectedKakaoAccountId, setSelectedKakaoAccountId] = useState(
    MOCK_KAKAO_ACCOUNTS[0].id
  );
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimer.current) clearTimeout(processingTimer.current);
    };
  }, []);

  const openCheckout = () => {
    setPaymentMethod("card");
    setSelectedCardId(MOCK_CARDS[0].id);
    setSelectedKakaoAccountId(MOCK_KAKAO_ACCOUNTS[0].id);
    setAgreedToTerms(false);
    setCheckoutStep("confirm");
  };

  const closeCheckout = () => {
    if (processingTimer.current) clearTimeout(processingTimer.current);
    setCheckoutStep("idle");
  };

  const handlePay = () => {
    if (!agreedToTerms) return;
    setCheckoutStep("processing");
    processingTimer.current = setTimeout(() => {
      setIsPro(true);
      setCheckoutStep("success");
    }, PROCESSING_DELAY_MS);
  };

  return (
    <Screen>
      <Text style={styles.title}>설정</Text>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>테마</Text>
        <View style={styles.chipRow}>
          {THEME_NAMES.map((name) => (
            <Pressable
              key={name}
              style={[styles.chip, theme === name && styles.chipSelected]}
              onPress={() => setTheme(name)}
            >
              <ThemeSwatch name={name} />
              <Text style={[styles.chipText, theme === name && styles.chipTextSelected]}>
                {THEME_LABELS[name]}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>로그인 유지 시간</Text>
        <Text style={styles.sectionNote}>
          선택한 시간이 지나면 다음에 앱을 열 때 자동으로 로그아웃돼요.
        </Text>
        <View style={styles.chipRow}>
          {SESSION_DURATION_OPTIONS.map((duration) => (
            <Pressable
              key={duration}
              style={[styles.chip, sessionDuration === duration && styles.chipSelected]}
              onPress={() => setSessionDuration(duration)}
            >
              <Text
                style={[
                  styles.chipText,
                  sessionDuration === duration && styles.chipTextSelected,
                ]}
              >
                {SESSION_DURATION_LABELS[duration]}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>메소 플래너 + 프로</Text>
        <Text style={styles.planStatus}>
          현재 플랜: {isPro ? "프로" : "무료"}
        </Text>
        {!isPro ? (
          <>
            <Text style={styles.proPrice}>{PRO_PRICE_LABEL}</Text>
            <Text style={styles.sectionNote}>
              가계부 무제한 보관, 엑셀 내보내기, 누적 통계 등을 이용할 수 있어요.
            </Text>
            <Pressable style={styles.proButton} onPress={openCheckout}>
              <Text style={styles.proButtonText}>프로 시작하기</Text>
            </Pressable>
            <Text style={styles.proTestNote}>
              결제 연동 전 시연용 화면이에요. 실제 결제는 청구되지 않아요.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sectionNote}>프로 혜택을 이용 중이에요. 감사합니다!</Text>
            <Pressable style={styles.proSecondaryButton} onPress={() => setIsPro(false)}>
              <Text style={styles.proSecondaryButtonText}>해지 (테스트용)</Text>
            </Pressable>
          </>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>정보</Text>
        <Pressable
          style={styles.linkRow}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        >
          <Text style={styles.linkRowText}>개인정보처리방침</Text>
          <Text style={styles.linkRowChevron}>›</Text>
        </Pressable>
      </Card>

      <Modal
        visible={checkoutStep !== "idle"}
        animationType="slide"
        onRequestClose={() => {
          if (checkoutStep !== "processing") closeCheckout();
        }}
      >
        {checkoutStep === "confirm" && (
          <Screen>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeCheckout} hitSlop={12}>
                <Text style={styles.backArrow}>‹</Text>
              </Pressable>
              <Text style={styles.modalTitle}>결제 확인</Text>
            </View>

            <Card style={styles.card}>
              <Text style={styles.sectionNote}>주문 내역</Text>
              <Text style={styles.planStatus}>메소 플래너 + 프로</Text>
              <Text style={styles.sectionNote}>월 3,300원 · 매월 자동 결제</Text>
              <View style={styles.chipRow}>
                <View style={styles.benefitChip}>
                  <Text style={styles.benefitChipText}>무제한 보관</Text>
                </View>
                <View style={styles.benefitChip}>
                  <Text style={styles.benefitChipText}>엑셀 내보내기</Text>
                </View>
                <View style={styles.benefitChip}>
                  <Text style={styles.benefitChipText}>누적 통계</Text>
                </View>
              </View>
            </Card>

            <Text style={styles.sectionTitle}>결제 수단</Text>
            {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
              <View key={method}>
                <Pressable
                  style={[
                    styles.payOption,
                    paymentMethod === method && styles.payOptionSelected,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <View
                    style={[styles.payDot, paymentMethod === method && styles.payDotSelected]}
                  >
                    {paymentMethod === method && <View style={styles.payDotFill} />}
                  </View>
                  <Text style={styles.payOptionText}>{PAYMENT_METHOD_LABELS[method]}</Text>
                </Pressable>

                {paymentMethod === method && method === "card" && (
                  <View style={styles.instrumentList}>
                    {MOCK_CARDS.map((card) => (
                      <Pressable
                        key={card.id}
                        style={[
                          styles.instrumentRow,
                          selectedCardId === card.id && styles.instrumentRowSelected,
                        ]}
                        onPress={() => setSelectedCardId(card.id)}
                      >
                        <View style={[styles.cardBadge, { backgroundColor: card.badgeColor }]}>
                          <Text style={styles.cardBadgeText}>{card.badgeText}</Text>
                        </View>
                        <View style={styles.instrumentTextCol}>
                          <Text style={styles.instrumentLabel}>{card.label}</Text>
                          <Text style={styles.instrumentSub}>{card.sub}</Text>
                        </View>
                        <View
                          style={[
                            styles.payDot,
                            selectedCardId === card.id && styles.payDotSelected,
                          ]}
                        >
                          {selectedCardId === card.id && <View style={styles.payDotFill} />}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}

                {paymentMethod === method && method === "kakaopay" && (
                  <View style={styles.instrumentList}>
                    {MOCK_KAKAO_ACCOUNTS.map((account) => (
                      <Pressable
                        key={account.id}
                        style={[
                          styles.instrumentRow,
                          selectedKakaoAccountId === account.id &&
                            styles.instrumentRowSelected,
                        ]}
                        onPress={() => setSelectedKakaoAccountId(account.id)}
                      >
                        <View style={styles.kakaoBadge}>
                          <Text style={styles.kakaoBadgeText}>K</Text>
                        </View>
                        <View style={styles.instrumentTextCol}>
                          <Text style={styles.instrumentLabel}>{account.name}</Text>
                          <Text style={styles.instrumentSub}>{account.phone}</Text>
                        </View>
                        <View
                          style={[
                            styles.payDot,
                            selectedKakaoAccountId === account.id && styles.payDotSelected,
                          ]}
                        >
                          {selectedKakaoAccountId === account.id && (
                            <View style={styles.payDotFill} />
                          )}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ))}

            <Pressable
              style={styles.termsRow}
              onPress={() => setAgreedToTerms((prev) => !prev)}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>구매 조건 및 자동결제에 동의합니다</Text>
            </Pressable>

            <Pressable
              style={[styles.proButton, !agreedToTerms && styles.proButtonDisabled]}
              onPress={handlePay}
              disabled={!agreedToTerms}
            >
              <Text style={styles.proButtonText}>3,300원 결제하기</Text>
            </Pressable>
            <Text style={styles.proTestNote}>
              실제 결제는 청구되지 않는 시연용 화면이에요.
            </Text>
          </Screen>
        )}

        {checkoutStep === "processing" && (
          <SafeAreaView style={styles.checkoutCenterScreen}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.planStatus}>결제를 처리하고 있어요</Text>
            <Text style={styles.sectionNote}>잠시만 기다려주세요</Text>
          </SafeAreaView>
        )}

        {checkoutStep === "success" && (
          <SafeAreaView style={styles.checkoutCenterScreen}>
            <View style={styles.checkBadge}>
              <Text style={styles.checkBadgeText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>프로가 시작됐어요!</Text>
            <Text style={styles.successSub}>
              이제 가계부를 무제한으로 보관하고 엑셀로 내보낼 수 있어요
            </Text>
            <Card style={styles.statusCard}>
              <Text style={styles.sectionNote}>현재 플랜</Text>
              <Text style={styles.planStatus}>프로</Text>
            </Card>
            <Pressable
              style={[styles.proButton, styles.checkoutButtonWidth]}
              onPress={closeCheckout}
            >
              <Text style={styles.proButtonText}>확인</Text>
            </Pressable>
          </SafeAreaView>
        )}
      </Modal>
    </Screen>
  );
}

/** 테마 선택 칩 옆에 보여주는 작은 색상 미리보기 동그라미 */
function ThemeSwatch({ name }: { name: ThemeName }) {
  const palette = getColors(name);
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
        backgroundColor: palette.primary,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    />
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: "700",
      marginTop: 8,
      marginBottom: 20,
    },
    card: {
      marginBottom: 16,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
    },
    sectionNote: {
      color: colors.textMuted,
      fontSize: 12,
      marginBottom: 12,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
    },
    chipTextSelected: {
      color: colors.onPrimary,
    },
    planStatus: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 8,
    },
    proPrice: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
    },
    proButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    proButtonDisabled: {
      opacity: 0.4,
    },
    proButtonText: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    proTestNote: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 8,
      textAlign: "center",
    },
    proSecondaryButton: {
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    proSecondaryButtonText: {
      color: colors.textMuted,
      fontSize: 13,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    linkRowText: {
      color: colors.text,
      fontSize: 15,
    },
    linkRowChevron: {
      color: colors.textMuted,
      fontSize: 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 8,
      marginBottom: 20,
    },
    backArrow: {
      color: colors.textMuted,
      fontSize: 26,
      fontWeight: "700",
      paddingRight: 2,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
    },
    benefitChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    benefitChipText: {
      color: colors.textMuted,
      fontSize: 11,
    },
    payOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    payOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceAlt,
    },
    payOptionText: {
      color: colors.text,
      fontSize: 14,
    },
    payDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: colors.textMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    payDotSelected: {
      borderColor: colors.primary,
    },
    payDotFill: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    instrumentList: {
      marginLeft: 12,
      marginBottom: 10,
      gap: 8,
    },
    instrumentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    instrumentRowSelected: {
      borderColor: colors.primary,
    },
    instrumentTextCol: {
      flex: 1,
    },
    instrumentLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 2,
    },
    instrumentSub: {
      color: colors.textMuted,
      fontSize: 11.5,
      fontVariant: ["tabular-nums"],
    },
    cardBadge: {
      width: 34,
      height: 24,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBadgeText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
    },
    kakaoBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#FEE500",
      alignItems: "center",
      justifyContent: "center",
    },
    kakaoBadgeText: {
      color: "#3C1E1E",
      fontSize: 12,
      fontWeight: "700",
    },
    termsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
      marginBottom: 20,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      color: colors.onPrimary,
      fontWeight: "700",
      fontSize: 12,
    },
    termsText: {
      color: colors.textMuted,
      fontSize: 12.5,
      flex: 1,
    },
    checkoutCenterScreen: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 12,
    },
    checkBadge: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    checkBadgeText: {
      color: colors.onPrimary,
      fontSize: 30,
      fontWeight: "700",
    },
    successTitle: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "700",
    },
    successSub: {
      color: colors.textMuted,
      fontSize: 13,
      textAlign: "center",
      maxWidth: 240,
      marginBottom: 6,
    },
    statusCard: {
      width: "100%",
      maxWidth: 320,
      alignItems: "center",
      marginBottom: 8,
    },
    checkoutButtonWidth: {
      width: "100%",
      maxWidth: 320,
    },
  });
}
