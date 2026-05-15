async function test() {
  console.log("Testing GET https://www.kap.org.tr/tr/api/member/THYAO");
  try {
    const res1 = await fetch('https://www.kap.org.tr/tr/api/member/THYAO', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    const data1 = await res1.json();
    console.log("Response starts with:", JSON.stringify(data1).substring(0, 200));
  } catch (e) {
    console.error("Error 1:", e);
  }

  console.log("\nTesting POST https://www.kap.org.tr/tr/api/memberDisclosureQuery");
  try {
    const res2 = await fetch('https://www.kap.org.tr/tr/api/memberDisclosureQuery', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ memberCodes: ["THYAO"] })
    });
    const data2 = await res2.json();
    console.log("Response starts with:", JSON.stringify(data2).substring(0, 200));
  } catch (e) {
    console.error("Error 2:", e);
  }
  
  console.log("\nTesting POST https://www.kap.org.tr/tr/api/memberDisclosureQuery with 'memberOid'");
  try {
    const res3 = await fetch('https://www.kap.org.tr/tr/api/memberDisclosureQuery', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ memberOid: "43890000000000000000000000000000", fromDate: "2024-01-01", toDate: "2024-02-01" }) // Wait, THYAO might have an OID? Let's check the first GET request first to see if it returns an OID.
    });
    const data3 = await res3.text();
    console.log("Response3 starts with:", data3.substring(0, 200));
  } catch (e) {
    console.error("Error 3:", e);
  }
}

test();
