import { suffix } from "bun:ffi";
import path from "path";
import { mkdir } from "fs/promises";
import os from "node:os";
import { $ } from "bun";

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

class DissectCache {
	#folder;
	#lib;
	#version;
	#download;

	constructor(folder: string = ".dissect") {
		this.#folder = folder;
		this.#lib = Bun.file(path.join(folder, `libr6dissect.${suffix}`));
		this.#version = Bun.file(path.join(folder, `libr6dissect.${suffix}.version`));
		this.#download = Bun.file(path.join(folder, ".download"));
	}

	lib() {
		return this.#lib;
	}

	async exists() {
		return await this.#lib.exists();
	}

	async lastUpdateCheck() {
		return (await this.#version.exists()) ? Date.now() - this.#version.lastModified : -1;
	}

	async version() {
		if (!(await this.#version.exists())) return null;
		return await this.#version.text();
	}

	async #fetchUpdateDetails() {
		const response = (await fetch("https://api.github.com/repos/redraskal/r6-dissect/releases", {
			headers: {
				Accept: "application/vnd.github+json",
			},
		}).then((res) => res.json())) as any[];
		const release = response[0];
		const target = `${os.platform()}-${os.arch() == "x64" ? "amd64" : os.arch()}`;
		const asset = release.assets.find((asset: any) => asset.name.indexOf(target) > -1);
		if (!asset) {
			throw new Error(`Release not found for ${target}.`);
		}
		return {
			version: release.tag_name,
			url: asset.browser_download_url,
		};
	}

	async update() {
		const details = await this.#fetchUpdateDetails();
		if ((await this.version()) != details.version) {
			await mkdir(this.#folder, { recursive: true });
			const response = await fetch(details.url);
			await Bun.write(this.#download, response);
			await $`tar zxf ${this.#download.name} -C ${this.#folder} ${path.basename(this.#lib.name!)} && rm ${this.#download.name}`;
		}
		await Bun.write(this.#version, details.version);
	}
}

export interface DissectOptions {
	binaryPath?: string;
	cachePath?: string;
	smol?: boolean;
}

export class Dissect {
	#options?: DissectOptions;
	readonly cache: DissectCache;
	#worker?: Worker;

	constructor(options?: DissectOptions) {
		this.#options = options;
		this.cache = new DissectCache(options?.cachePath);
	}

	async #init() {
		if (!this.#options?.binaryPath) {
			const exists = await this.cache.exists();
			if (!exists || (await this.cache.lastUpdateCheck()) > 900000) {
				try {
					await this.cache.update();
				} catch (err) {
					if (!exists) {
						throw err;
					}
				}
			}
		}
		this.#worker = new Worker(new URL("worker.ts", import.meta.url).href, {
			name: "r6-dissect",
			smol: this.#options?.smol || false,
			argv: [this.#options?.binaryPath || this.cache.lib().name!],
		});
		this.#worker.unref();
	}

	async #read(path: string) {
		if (!this.#worker) await this.#init();
		return new Promise((resolve, reject) => {
			this.#worker!.postMessage(path);
			this.#worker!.addEventListener(
				"message",
				(event) => {
					if (event.data.error) {
						reject(event.data.error);
					} else {
						resolve(event.data.data);
					}
				},
				{ once: true }
			);
		});
	}

	async replay(path: string) {
		return this.#read(path) as unknown as Replay;
	}

	async match(path: string) {
		return this.#read(path) as unknown as Match;
	}
}
