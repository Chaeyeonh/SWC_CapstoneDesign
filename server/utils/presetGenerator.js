exports.generatePresets = function(cpuList, networkList, gpuList, memoryList) {
    const presets = [];
  
    cpuList.forEach(cpu => {
      networkList.forEach(network => {
        gpuList.forEach(gpu => {
          memoryList.forEach(memory => {
            presets.push({ cpu, network, gpu, memory });
          });
        });
      });
    });
  
    return presets;
  }

  