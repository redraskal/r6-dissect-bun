import { test, expect } from "bun:test";
import { dissect } from ".";

test("can read test.rec", async () => {
	const { data, error } = await dissect("test.rec");
	expect(error).toBeUndefined();
	expect(data?.matchID).toBe("98ea92e1-2285-47a2-8e03-f17f96557640");
});

test("cannot read non-existant file", async () => {
	const { data, error } = await dissect("nooooooooo");
	expect(data).toBeUndefined();
	expect(error).toBe("stat nooooooooo: no such file or directory");
});
