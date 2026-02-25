export type NodeType =
	| 'USER'
	| 'MERCHANT'
	| 'TRANSACTION'
	| 'ISSUER'
	| 'DEVICE';

export interface GraphNode {
	id: string;
	name: string;
	type: NodeType;
	riskScore?: number;
	val: number;
	color: string;
	x?: number;
	y?: number;
}

export interface GraphLink {
	source: string;
	target: string;
	id: string;
	type: 'PAYMENT' | 'OWNERSHIP' | 'LOCATION';
	amount?: number;
	currency?: string;
	time: string;
	txCount?: number;
}

export interface GraphData {
	nodes: GraphNode[];
	links: GraphLink[];
}
