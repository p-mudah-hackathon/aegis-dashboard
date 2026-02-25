export type TransactionStatus = 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED';

export interface Transaction {
	txnId: string;
	timestamp: string;
	userId: string;
	deviceId: string;
	deviceOs: 'iOS' | 'Android';
	ipCountry: string;
	issuerId: string;
	issuerCountry: string;
	merchantId: string;
	merchantMcc: string;
	merchantCity: string;
	merchantRiskScore: number;
	amountIdr: number;
	userAvgAmount7d: number;
	userTxnCount24h: number;
	txnVelocity10m: number;
	timeSinceLastTxnSec: number;
	countrySwitch24h: number;
	isNewDevice: boolean;
	sharedDevice24h: boolean;
	status: TransactionStatus;
}
