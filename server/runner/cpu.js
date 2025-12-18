async function applyCPUThrottling(client, cpu) {
  const rates = {
    veryverylow: 10,
    verylow: 4,
    low:2,
    normal:1
  };

  const rate = rates[cpu] || 1;

  await client.send("Emulation.setCPUThrottlingRate", { rate });
}

module.exports = { applyCPUThrottling };