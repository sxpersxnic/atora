async function loadWasm(path: string): Promise<WebAssembly.Module> {
	return await WebAssembly.compileStreaming(fetch(path));
}

async function instantiateWasm(module: WebAssembly.Module, imports?: WebAssembly.Imports): Promise<WebAssembly.Instance> {
	return await WebAssembly.instantiate(module, imports);
}

const wasm = {
	load: loadWasm,
	instantiate: instantiateWasm,
}

export default wasm;