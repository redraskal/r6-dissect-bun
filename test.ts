import { dissect } from ".";

async function test() {
	const { data, error } = await dissect("test.rec");

	if (error) {
		console.error(error);
		return;
	}

	console.log(`${data.gameVersion}`);
}

await test();
