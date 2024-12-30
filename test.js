// Hàm tạo giá trị ngẫu nhiên phân phối đều
function randomUniform(min, max) {
    return Math.random() * (max - min) + min;
}

// Hàm làm tròn giá trị đến 1 chữ số thập phân
function roundToOneDecimal(num) {
    return Math.round(num * 10) / 10;
}

// Hàm tạo input ngẫu nhiên với điều kiện số need <= số slot
function generateInput() {
    const numSlot = Math.floor(randomUniform(3, 16)); // Số lượng slot từ 3 đến 16
    const numNeed = Math.floor(randomUniform(3, Math.min(8, numSlot))); // Số need từ 3 đến min(8, numSlot)

    let slot, need, totalSlot, totalNeed;
    do {
        slot = Array.from({ length: numSlot }, () => roundToOneDecimal(randomUniform(0.5, 5)));
        need = Array.from({ length: numNeed }, () => roundToOneDecimal(randomUniform(1, 10)));
        totalSlot = slot.reduce((a, b) => a + b, 0);
        totalNeed = need.reduce((a, b) => a + b, 0);
    } while (Math.abs(totalSlot - totalNeed) > 1); // Đảm bảo tổng slot và need cách nhau không quá 1
    console.log({ slot, need })
    return { slot, need };
}

// Hàm kiểm thử với numTests input ngẫu nhiên
function testWithRandomInputs(numTests) {
    let totalGreedyTime = 0, totalTurnTime = 0, totalBranchAndBoundTime = 0, totalRandomTime = 0, totalBeamTime = 0;
    let totalGreedyEfficiency = 0, totalTurnEfficiency = 0, totalBranchAndBoundEfficiency = 0, totalRandomEfficiency = 0, totalBeamEfficiency = 0;

    for (let i = 0; i < numTests; i++) {
        console.log("-- TEST " + (i+1) + " --");
        // Tạo input ngẫu nhiên với điều kiện số need <= số slot
        const { slot, need } = generateInput();

        // Tính thời gian thực thi và hiệu quả cho từng thuật toán
        const startBranchAndBound = performance.now();
        const resultBranchAndBound = optimalSchedule(slot, need);
        branchAndBoundTime = performance.now() - startBranchAndBound;
        totalBranchAndBoundTime += branchAndBoundTime;
        console.log("Branch and Bound - Thời gian: " + branchAndBoundTime.toFixed(1) + " ms");
        totalBranchAndBoundEfficiency += missingHours2(slot, need, resultBranchAndBound);

        const startRandom = performance.now();
        const resultRandom = randomSchedule(slot, need);
        totalRandomTime += performance.now() - startRandom;
        totalRandomEfficiency += missingHours2(slot, need, resultRandom);

        const startGreedy = performance.now();
        const resultGreedy = greedySchedule(slot, need);
        totalGreedyTime += performance.now() - startGreedy;
        totalGreedyEfficiency += missingHours2(slot, need, resultGreedy);

        const startTurn = performance.now();
        const resultTurn = turnSchedule(slot, need);
        totalTurnTime += performance.now() - startTurn;
        totalTurnEfficiency += missingHours2(slot, need, resultTurn);

        const startBeam = performance.now();
        const resultBeam = beamSearch(slot, need);
        beamTime = performance.now() - startBeam;
        totalBeamTime += beamTime;
        console.log("Beam Search - Thời gian: " + beamTime.toFixed(1) + " ms");
        totalBeamEfficiency += missingHours2(slot, need, resultBeam);
    }

    // Tính trung bình
    console.log("=== Kết quả trung bình ===");
    console.log("Branch and Bound - Thời gian:", (totalBranchAndBoundTime/numTests).toFixed(1), "ms, Hiệu quả:", (-totalBranchAndBoundEfficiency/numTests).toFixed(1));
    console.log("Beam Search - Thời gian:", (totalBeamTime/numTests).toFixed(1), "ms, Hiệu quả:", (-totalBeamEfficiency/numTests).toFixed(1));
    console.log("Greedy - Thời gian:", (totalGreedyTime/numTests).toFixed(1), "ms, Hiệu quả:", (-totalGreedyEfficiency/numTests).toFixed(1));
    console.log("Randomized - Thời gian:", (totalRandomTime/numTests).toFixed(1), "ms, Hiệu quả:", (-totalRandomEfficiency/numTests).toFixed(1));
    console.log("Turn-based - Thời gian:", (totalTurnTime/numTests).toFixed(1), "ms, Hiệu quả:", (-totalTurnEfficiency/numTests).toFixed(1));
}
