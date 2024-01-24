# r6-dissect for Bun

Bun API for Rainbow Six: Siege's Dissect (.rec) format.

## Features

- Automatic r6-dissect library updates
- Cross-platform support
- Asynchronous Worker execution

## To install:

```bash
bun i r6-dissect
```

## To read a replay file:

```ts
import { Dissect } from "r6-dissect";

const dissect = new Dissect();

try {
	const replay = await dissect.replay("Match-2023-03-13_23-23-58-199-R01.rec");
	console.log(replay.matchID); // "d74d2685-193f-4fee-831f-41f8c7792250"
	console.log(replay.players[0].username); // "redraskal"
} catch (error) {
	console.error(error);
}
```

## To read a match:

```ts
import { Dissect } from "r6-dissect";

const dissect = new Dissect();

try {
	const match = await dissect.match("Match-2023-03-13_23-23-58-199/");
	console.log(`redraskal has ${match.stats[0].kills} kills`); // "redraskal has 6 kills"
	console.log(match.rounds[0].players[0].username); // "redraskal"
} catch (error) {
	console.error(error);
}
```

This project was created using `bun init` in bun v0.6.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
