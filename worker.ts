import { dlopen, FFIType, suffix } from "bun:ffi";
import { join } from "path";

const {
	symbols: { dissect_read },
} = dlopen(join(import.meta.dir, `libr6dissect.${suffix}`), {
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

// @ts-ignore
self.onmessage = (event: MessageEvent) => {
	// @ts-ignore
	postMessage(_read(event.data));
};
