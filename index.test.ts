import { test, expect } from "bun:test";
import { Dissect } from ".";

const dissect = new Dissect();

test("can read a replay", async () => {
	const replay = await dissect.replay("replays/test.rec");
	expect(replay.matchID).toBe("98ea92e1-2285-47a2-8e03-f17f96557640");
});

test("can read a match", async () => {
	const match = await dissect.match("replays/Match-2023-06-10_01-28-10-228");
	expect(match.rounds).toBeArrayOfSize(1);
});

test("cannot read non-existant file", async () => {
	expect(async () => await dissect.replay("nooooooooo")).toThrow("stat nooooooooo: no such file or directory");
});
