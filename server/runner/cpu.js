async function applyCPUThrottling(client, cpu) {
  const rates = {
    low: 6,      // 6x slower
    medium: 3,
    high: 1
  };

  const rate = rates[cpu] || 1;

  await client.send("Emulation.setCPUThrottlingRate", { rate });
}

module.exports = { applyCPUThrottling };
