export interface WasmModule {
	memory: WebAssembly.Memory;
	[key: string]: WebAssembly.ExportValue;
}