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
        // Tạo input ngẫu nhiên với điều kiện số need <= số slot
        const { slot, need } = generateInput();

        // Tính thời gian thực thi và hiệu quả cho từng thuật toán
        const startBranchAndBound = performance.now();
        const resultBranchAndBound = optimalSchedule(slot, need);
        branchAndBoundTime = performance.now() - startBranchAndBound;
        totalBranchAndBoundTime += branchAndBoundTime;
        //console.log("Branch and Bound - Thời gian: " + roundToOneDecimal(branchAndBoundTime) + " ms");
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
        //console.log("Beam Search - Thời gian: " + roundToOneDecimal(beamTime) + " ms");
        totalBeamEfficiency += missingHours2(slot, need, resultBeam);
    }

    // Tính trung bình
    console.log("=== Kết quả trung bình ===");
    console.log("Branch and Bound - Thời gian:", roundToOneDecimal(totalBranchAndBoundTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalBranchAndBoundEfficiency/numTests));
    console.log("Beam Search - Thời gian:", roundToOneDecimal(totalBeamTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalBeamEfficiency/numTests));
    console.log("Greedy - Thời gian:", roundToOneDecimal(totalGreedyTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalGreedyEfficiency/numTests));
    console.log("Randomized - Thời gian:", roundToOneDecimal(totalRandomTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalRandomEfficiency/numTests));
    console.log("Turn-based - Thời gian:", roundToOneDecimal(totalTurnTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalTurnEfficiency/numTests));
}
