import { test, expect } from "bun:test";
import { dissect, dissectMatch } from ".";

test("can read a replay", async () => {
	const { data, error } = await dissect("replays/test.rec");
	expect(error).toBeUndefined();
	expect(data!.matchID).toBe("98ea92e1-2285-47a2-8e03-f17f96557640");
});

test("can read a match", async () => {
	const { data, error } = await dissectMatch("replays/Match-2023-06-10_01-28-10-228");
	expect(error).toBeUndefined();
	expect(data!.rounds).toBeArrayOfSize(1);
});

test("cannot read non-existant file", async () => {
	const { data, error } = await dissect("nooooooooo");
	expect(data).toBeUndefined();
	expect(error).toBe("stat nooooooooo: no such file or directory");
});
