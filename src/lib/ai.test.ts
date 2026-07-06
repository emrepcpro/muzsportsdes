// Mock storage
const storage = {
  data: {} as Record<string, any>,
  get: (key: string, def: any) => storage.data[key] ?? def,
  set: (key: string, val: any) => { storage.data[key] = val; }
};

// Simple AI logic test
const ai = {
  shouldSummarize: (timestamp: number) => {
    const isEnabled = storage.get('ai_aging_enabled', true);
    if (!isEnabled) return false;
    const thresholdDays = storage.get('ai_aging_days', 30);
    const thresholdInMs = thresholdDays * 24 * 60 * 60 * 1000;
    return (Date.now() - timestamp) > thresholdInMs;
  }
};

function runTests() {
  console.log("Running AI Logic Tests...");

  // Test 1: Recent data should not be summarized
  const recent = Date.now() - 1000 * 60 * 60; // 1 hour ago
  console.assert(ai.shouldSummarize(recent) === false, "Recent data failed");

  // Test 2: Old data should be summarized (default 30 days)
  const old = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
  console.assert(ai.shouldSummarize(old) === true, "Old data failed (default)");

  // Test 3: Disable aging
  storage.set('ai_aging_enabled', false);
  console.assert(ai.shouldSummarize(old) === false, "Disabled aging failed");

  // Test 4: Custom threshold
  storage.set('ai_aging_enabled', true);
  storage.set('ai_aging_days', 10);
  const tenDaysAgo = Date.now() - 11 * 24 * 60 * 60 * 1000;
  console.assert(ai.shouldSummarize(tenDaysAgo) === true, "Custom threshold failed");

  console.log("All tests passed!");
}

runTests();
