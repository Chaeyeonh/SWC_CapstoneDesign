// server/runner/network.js

async function applyNetworkConditions(client, network) {
  await client.send("Network.enable");

  const presets = {
    "slow-3g": {
      downloadThroughput: (500 * 1024) / 8,
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    },
    "fast-3g": {
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
      latency: 150,
    },
    "4g": {
      downloadThroughput: (7 * 1024 * 1024) / 8,
      uploadThroughput: (3 * 1024 * 1024) / 8,
      latency: 20,
    },
  };

  const config = presets[network];
  if (config) {
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      ...config,
    });
  }
}

module.exports = { applyNetworkConditions };
