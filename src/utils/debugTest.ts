// Debug test function to check Starlink TLE parsing
export async function debugTestStarlink() {
  console.log(' Starting Starlink debug test...');
  
  try {
    // Test direct URL fetch
    console.log('📡 Fetching Starlink TLE data directly...');
    const response = await fetch('https://celestrak.org/NORAD/elements/starlink.txt');
    
    if (!response.ok) {
      console.error(' Failed to fetch Starlink data:', response.status, response.statusText);
      return;
    }
    
    const text = await response.text();
    console.log(` Fetched ${text.length} characters of Starlink data`);
    
    // Look for test IDs
    const testIds = ['44235', '44238', '51057'];
    
    for (const testId of testIds) {
      console.log(` Searching for NORAD ${testId}...`);
      
      // Search for the ID in the raw text
      const foundInText = text.includes(testId);
      console.log(`Found ${testId} in raw text: ${foundInText}`);
      
      if (foundInText) {
        // Find the line containing the ID
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes(testId)) {
            console.log(`Found ${testId} at line ${i}: ${line.substring(0, 50)}...`);
            
            // Show context around this line
            const start = Math.max(0, i - 2);
            const end = Math.min(lines.length, i + 3);
            console.log('Context:');
            for (let j = start; j < end; j++) {
              console.log(`${j}: ${lines[j]}`);
            }
            break;
          }
        }
      }
    }
    
    console.log(' Debug test completed');
    
  } catch (error) {
    console.error(' Debug test failed:', error);
  }
}

// Test the parsing function directly
export async function debugTestParsing() {
  console.log(' Testing parsing function...');
  
  try {
    // Import the parse function (we'll need to make it exportable)
    const { parseTLEData } = await import('./satelliteUtils');
    
    const response = await fetch('https://celestrak.org/NORAD/elements/starlink.txt');
    const text = await response.text();
    
    console.log('Parsing Starlink data...');
    const tleMap = parseTLEData(text, 'starlink');
    
    console.log(`Parsed ${tleMap.size} TLEs`);
    
    // Check for our test IDs
    const testIds = ['44235', '44238', '51057'];
    for (const testId of testIds) {
      const tle = tleMap.get(testId);
      if (tle) {
        console.log(` Found ${testId}: ${tle.name}`);
      } else {
        console.log(` Missing ${testId}`);
      }
    }
    
  } catch (error) {
    console.error(' Parsing test failed:', error);
  }
}
