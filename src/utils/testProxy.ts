// Test function to verify proxy is working
export async function testProxyConnection() {
  console.log(' Testing proxy connection to Celestrak...');
  
  try {
    // Test the stations endpoint
    const response = await fetch('/api/celestrak/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle');
    
    if (response.ok) {
      const text = await response.text();
      console.log(` Proxy working! Received ${text.length} characters`);
      
      // Count how many TLEs we got
      const lines = text.split('\n').filter(line => line.trim().startsWith('1 '));
      console.log(` Found ${lines.length} satellites in stations data`);
      
      return true;
    } else {
      console.error(` Proxy failed with status: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(' Proxy test failed:', error);
    return false;
  }
}

// Test Starlink specifically
export async function testStarlinkProxy() {
  console.log('🛰️ Testing Starlink proxy connection...');
  
  try {
    const response = await fetch('/api/celestrak/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle');
    
    if (response.ok) {
      const text = await response.text();
      console.log(` Starlink proxy working! Received ${text.length} characters`);
      
      // Look for specific Starlink satellites
      const has44714 = text.includes('44714');
      const has44718 = text.includes('44718');
      const has44723 = text.includes('44723');
      
      console.log(` Found Starlink satellites: 44714=${has44714}, 44718=${has44718}, 44723=${has44723}`);
      
      return { success: true, has44714, has44718, has44723 };
    } else {
      console.error(` Starlink proxy failed with status: ${response.status} ${response.statusText}`);
      return { success: false };
    }
  } catch (error) {
    console.error(' Starlink proxy test failed:', error);
    return { success: false };
  }
}
