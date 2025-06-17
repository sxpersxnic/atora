#!/usr/bin/env bash

function buildCrate() {
	local crate=$1
	cd "./crates/${crate}" && wasm-pack build --target bundler --out-dir ../../package/${crate}
	if [ $? -ne 0 ]; then
		echo "[-] Error: Failed to build ${crate}"
		exit 1
	fi
	echo "[+] Successfully built ${crate}"
}
buildCrate 'link'