#!/usr/bin/env bash

function buildCrate() {
	local crate=$1
	cd "./src/wasm/${crate}" && wasm-pack build --target bundler --out-dir ../../../dist/${crate}
	if [ $? -ne 0 ]; then
		echo "[-] Error: Failed to build ${crate}"
		exit 1
	fi
	echo "[+] Successfully built ${crate}"
	cd -
}

echo "[*] Building WASM crates..."
buildCrate 'link'
buildCrate 'utils'
buildCrate 'url-tools'
echo "[+] All WASM crates built successfully!"