/** Simulated bot responses for demo purposes */
const RESPONSES: Record<string, string> = {
	default:
		'I can help you investigate suspicious transactions, analyze fraud patterns, and review risk scores. Try asking me about a specific transaction ID, user, or merchant.',
	greeting:
		"Hello! I'm AEGIS Investigation Bot 🤖\n\nI can help you with:\n• 🔍 Transaction analysis\n• ⚠️ Fraud pattern detection\n• 📊 Risk score explanation\n• 🏪 Merchant risk assessment\n\nWhat would you like to investigate?",
	tx: 'Based on my analysis of this transaction:\n\n📋 **Transaction Details:**\n• Risk Score: 0.528 (Medium)\n• Device: iOS, IP from CN\n• Issuer: ISS_PAYPAY (JP)\n• Merchant Risk: Medium\n\n⚠️ **Risk Indicators:**\n• Cross-border transaction (CN → ID)\n• Amount slightly below average\n• No velocity anomalies detected\n\n✅ **Recommendation:** APPROVE — Low fraud probability. Cross-border activity is consistent with user history.',
	fraud:
		'Based on current data patterns:\n\n🔴 **High-Risk Patterns Detected:**\n1. **Velocity Spike** — 3 transactions in 10 minutes from U8821\n2. **New Device + Shared Device** — TX-7, TX-11, TX-17\n3. **Cross-border Switching** — Multiple country switches in 24h\n4. **Amount Anomaly** — IDR 4.75M vs avg IDR 185K (25x normal)\n\n📊 **Statistics:**\n• Blocked: 4 transactions\n• Flagged: 3 transactions\n• Pending Review: 8 transactions\n\nWould you like me to drill down into a specific pattern?',
	merchant:
		'🏪 **Merchant Risk Analysis:**\n\n| Merchant | City | Risk Score | Status |\n|----------|------|-----------|--------|\n| M892 | Surabaya | 0.741 | ⛔ HIGH |\n| M675 | Yogyakarta | 0.890 | ⛔ CRITICAL |\n| M1240 | Surabaya | 0.528 | ⚠️ MEDIUM |\n| M539 | Makassar | 0.050 | ✅ LOW |\n\nM675 and M892 have the highest risk scores. Multiple blocked transactions are associated with these merchants.\n\nWould you like me to investigate a specific merchant?',
	user: '👤 **User Behavior Analysis:**\n\nLooking at recent user activity patterns:\n\n• **U8821** — 🔴 High Risk\n  - 5 transactions in 24h\n  - New device detected\n  - Multiple country switches\n  - Total: IDR 7.4M (abnormal)\n\n• **U7745** — 🔴 High Risk\n  - 6 transactions, shared device\n  - Velocity: 3 txns in 10 min\n  - Country switch: MY → ID\n\n• **U2566** — 🟡 Medium\n  - 2 transactions, same device\n  - Consistent behavior\n\nShall I generate a detailed report on any user?',
	risk: "📊 **Risk Score Explanation:**\n\nThe AEGIS risk scoring model considers:\n\n1. **Transaction Velocity** (weight: 25%)\n   - Rapid successive transactions increase risk\n\n2. **Amount Deviation** (weight: 20%)\n   - Compared to user's 7-day average\n\n3. **Device Signals** (weight: 20%)\n   - New device, shared device flags\n\n4. **Geo Anomalies** (weight: 20%)\n   - IP country vs issuer country mismatch\n   - Country switching frequency\n\n5. **Merchant Risk** (weight: 15%)\n   - Historical fraud reports for merchant\n\nScores > 0.7 trigger auto-block. Scores 0.4-0.7 are flagged for review.",
};

function matchResponse(input: string): string {
	const lower = input.toLowerCase();

	if (
		lower.includes('hello') ||
		lower.includes('hi') ||
		lower.includes('halo') ||
		lower.includes('hey')
	)
		return RESPONSES.greeting;

	if (lower.includes('tx-') || lower.includes('transaction'))
		return RESPONSES.tx;

	if (
		lower.includes('fraud') ||
		lower.includes('pattern') ||
		lower.includes('suspicious')
	)
		return RESPONSES.fraud;

	if (lower.includes('merchant') || lower.includes('toko'))
		return RESPONSES.merchant;

	if (
		lower.includes('user') ||
		lower.includes('pengguna') ||
		lower.includes('behavior')
	)
		return RESPONSES.user;

	if (
		lower.includes('risk') ||
		lower.includes('score') ||
		lower.includes('model')
	)
		return RESPONSES.risk;

	return RESPONSES.default;
}

export function getBotResponse(userMessage: string): Promise<string> {
	return new Promise((resolve) => {
		const delay = 800 + Math.random() * 1200;
		setTimeout(() => {
			resolve(matchResponse(userMessage));
		}, delay);
	});
}
