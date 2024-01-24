import { dlopen, FFIType } from "bun:ffi";

declare var self: Worker;

const {
	symbols: { dissect_read },
} = dlopen(Bun.argv[2], {
	dissect_read: {
		args: [FFIType.cstring],
		returns: FFIType.cstring,
	},
});

function _read(path: string) {
	const buf = Buffer.from(path + "\0");
	// @ts-ignore
	return JSON.parse(dissect_read(buf));
}

self.onmessage = (event: MessageEvent) => {
	postMessage(_read(event.data));
};
