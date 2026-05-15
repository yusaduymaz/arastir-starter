async function test() {
  console.log("Testing GET https://www.kap.org.tr/tr/api/disclosures");
  try {
    const res = await fetch('https://www.kap.org.tr/tr/api/disclosures', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response length:", text.length);
    console.log("Response starts with:", text.substring(0, 500));
  } catch (e) {
    console.error("Error:", e);
  }
}
test();