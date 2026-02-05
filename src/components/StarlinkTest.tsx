import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTLE, getSatelliteCategory, getCacheSize, clearTLECache } from '@/utils/satelliteUtils';

// Test Starlink NORAD IDs from requirements
const TEST_SATELLITES = [
  { noradId: '51055', name: 'Starlink-1007' },
  { noradId: '51057', name: 'Starlink-1009' },
  { noradId: '48656', name: 'Starlink-44' },
  { noradId: '48657', name: 'Starlink-45' },
  { noradId: '25544', name: 'ISS (Control)' },
  { noradId: '20580', name: 'Hubble (Control)' }
];

export function StarlinkTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  const runTests = async () => {
    setIsTesting(true);
    const results = [];

    for (const satellite of TEST_SATELLITES) {
      try {
        const startTime = Date.now();
        const tle = await fetchTLE(satellite.noradId);
        const endTime = Date.now();
        const category = getSatelliteCategory(satellite.noradId, tle.name);
        
        results.push({
          noradId: satellite.noradId,
          expectedName: satellite.name,
          actualName: tle.name,
          category,
          fetchTime: endTime - startTime,
          status: 'success',
          source: tle.source
        });
      } catch (error) {
        results.push({
          noradId: satellite.noradId,
          expectedName: satellite.name,
          actualName: 'Not found',
          category: 'Unknown',
          fetchTime: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setTestResults(results);
    setCacheSize(getCacheSize());
    setIsTesting(false);
  };

  const clearCache = () => {
    clearTLECache();
    setCacheSize(0);
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Starlink TLE Validation</span>
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={isTesting}>
              {isTesting ? 'Testing...' : 'Run Tests'}
            </Button>
            <Button variant="outline" onClick={clearCache}>
              Clear Cache
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="text-sm font-medium">Cache Size: {cacheSize} entries</div>
          <div className="text-xs text-muted-foreground">
            Testing multi-source TLE fetching with 6-hour cache
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold mb-2">Test Results:</h3>
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success' 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-mono text-sm font-bold">
                      NORAD {result.noradId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Expected: {result.expectedName}
                    </div>
                    <div className="text-xs">
                      Actual: {result.actualName}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Category: {result.category}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Source: {result.source}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium ${
                      result.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.status === 'success' ? '✅ Success' : '❌ Error'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.fetchTime}ms
                    </div>
                  </div>
                </div>
                {result.error && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
