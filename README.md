# r6-dissect for Bun

Bun API for Rainbow Six: Siege's Dissect (.rec) format.

## To install:

```bash
bun i r6-dissect
```

## To read a replay file:

```ts
import { dissect } from "r6-dissect";

const { data, error } = await dissect("Match-2023-03-13_23-23-58-199-R01.rec");

if (error) {
	console.error(error);
} else {
	console.log(data.matchID); // "d74d2685-193f-4fee-831f-41f8c7792250"
	console.log(data.players[0].username); // "redraskal"
}
```

## To read a match:

```ts
import { dissectMatch } from "r6-dissect";

const { data, error } = await dissectMatch("Match-2023-03-13_23-23-58-199/");

if (error) {
	console.error(error);
} else {
	console.log(`redraskal has ${data.stats[0].kills} kills`); // "redraskal has 6 kills"
	console.log(data.rounds[0].players[0].username); // "redraskal"
}
```

This project was created using `bun init` in bun v0.6.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
