// server/runner/network.js

async function applyNetworkConditions(client, network) {
  await client.send("Network.enable");

  const presets = {
  "slow-3g": {
      downloadThroughput: (1.6 * 1024 * 1024) / 8, 
      uploadThroughput: (750 * 1024) / 8,         // 750 Kbps
      latency: 300,                               // 300ms (위성/장거리 통신 고려)
    },
  
  // 3G 
  "fast-3g": {
      downloadThroughput: (3 * 1024 * 1024) / 8,   // 3 Mbps
      latency: 150,                                
    },

  // 4G 
  "4g": {
    downloadThroughput: (9 * 1024 * 1024) / 8,   // 9 Mbps -> bps로 변환 후 초당 비트로
    latency: 170,                            // 170 ms 지연 시간
  },

  // 4G Fast 
  "fast-4g": {
    downloadThroughput: (10 * 1024 * 1024) / 8,  // 10 Mbps -> bps로 변환 후 초당 비트로
    latency: 40,                             // 40 ms 지연 시간
  },

  // LTE 
  "lte": {
    downloadThroughput: (12 * 1024 * 1024) / 8,  // 12 Mbps -> bps로 변환 후 초당 비트로
    latency: 70,                             // 70 ms 지연 시간
  },
};

  const config = presets[network];

if (config) {
  // `uploadThroughput`이 없으면 기본값을 설정
  const { downloadThroughput, uploadThroughput = downloadThroughput, latency } = config;
  
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    downloadThroughput,
    uploadThroughput, // 기본값을 사용하거나 설정된 값을 사용
    latency,
  });
}

}

module.exports = { applyNetworkConditions };
