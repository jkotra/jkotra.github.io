import init, { verify_key } from "./pgp-verify-wasm/pkg/pgp_verify_wasm.js"

function getPGP() {
    const codeBlock = document.querySelector("pre > code");
    return codeBlock.innerText;
}

async function run() {
    await init();
    const details = verify_key(getPGP());
    console.log(`PGP details:${details.id} Expiry: ${details.expiration}`);

    document.querySelector("code#pgp-id").innerText = details.id;
    document.querySelector("code#pgp-expiry").innerText = `${new Date(Number(details.expiration) * 1000).toLocaleString()} (${details.expiration})`;
}

run();