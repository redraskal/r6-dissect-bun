export type Entity = {
	name: string;
	id: number;
};

export type TeamRole = "Attack" | "Defense";
export type WinCondition =
	| "KilledOpponents"
	| "SecuredArea"
	| "DisabledDefuser"
	| "DefusedBomb"
	| "ExtractedHostage"
	| "Time";

export type Team = {
	name: string;
	score: number;
	won: boolean;
	winCondition?: WinCondition;
	role?: TeamRole;
};

export type Player = {
	id?: bigint;
	profileID?: string;
	username: string;
	teamIndex: number;
	operator: Entity;
	heroName?: number;
	alliance: number;
	roleImage?: number;
	roleName?: string;
	rolePortrait?: number;
	spawn?: string;
};

export type MatchUpdate = {
	type: Entity;
	username?: string;
	target?: string;
	headshot?: boolean;
	time: string;
	timeInSeconds: number;
	message?: string;
	operator?: Entity;
};

export type PlayerRoundStats = {
	username: string;
	kills: number;
	died: boolean;
	assists: number;
	headshots: number;
	headshotPercentage: number;
	"1vX"?: number;
};

export type Replay = {
	gameVersion: string;
	codeVersion: number;
	timestamp: string;
	matchType: Entity;
	map: Entity;
	site?: string;
	recordingPlayerID: bigint;
	recordingProfileID?: string;
	additionalTags: string;
	gamemode: Entity;
	roundsPerMatch: number;
	roundsPerMatchOvertime: number;
	roundNumber: number;
	overtimeRoundNumber: number;
	teams: Team[];
	players: Player[];
	gmSettings: number[];
	playlistCategory?: number;
	matchID: string;
	matchFeedback: MatchUpdate[];
	stats: PlayerRoundStats[];
};

export type PlayerMatchStats = {
	username: string;
	rounds: number;
	kills: number;
	deaths: number;
	assists: number;
	headshots: number;
	headshotPercentage: number;
};

export type Match = {
	rounds: Replay[];
	stats: PlayerMatchStats[];
};

export type ReplayResponse = {
	error?: string;
	data?: Replay;
};

export type MatchResponse = {
	error?: string;
	data?: Match;
};

const worker = new Worker(new URL("worker.ts", import.meta.url).href);

async function _read(path: string) {
	return new Promise((resolve) => {
		worker.postMessage(path);
		worker.addEventListener(
			"message",
			(event) => {
				resolve(event.data);
			},
			{ once: true }
		);
	});
}

export async function dissect(path: string) {
	return _read(path) as ReplayResponse;
}

export async function dissectMatch(path: string) {
	return _read(path) as MatchResponse;
}
