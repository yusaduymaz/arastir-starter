import { fetchDisclosures } from '../src/lib/kap/client';

async function main() {
    try {
        const disclosures = await fetchDisclosures("THYAO", 5);
        console.log("Fetched disclosures:");
        console.log(JSON.stringify(disclosures, null, 2));
    } catch (error) {
        console.error("Error fetching:", error);
    }
}

main();
