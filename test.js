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
function testWithRandomInputs(numTests = 1000) {
    let totalGreedyTime = 0, totalTurnTime = 0, totalBranchAndBoundTime = 0, totalRandomTime = 0, totalBeamTime = 0;
    let totalGreedyEfficiency = 0, totalTurnEfficiency = 0, totalBranchAndBoundEfficiency = 0, totalRandomEfficiency = 0, totalBeamEfficiency = 0;

    for (let i = 0; i < numTests; i++) {
        console.log("-- TEST", (i+1), "--");
        // Tạo input ngẫu nhiên với điều kiện số need <= số slot
        const { slot, need } = generateInput();

        // Tính thời gian thực thi và hiệu quả cho từng thuật toán
        const startBranchAndBound = performance.now();
        const resultBranchAndBound = optimalSchedule(slot, need);
        const branchAndBoundTime = performance.now() - startBranchAndBound;
        totalBranchAndBoundTime += branchAndBoundTime;
        const branchAndBoundEfficiency = missingHours2(slot, need, resultBranchAndBound);
        totalBranchAndBoundEfficiency += branchAndBoundEfficiency;
        console.log("Branch and Bound - Thời gian:", roundToOneDecimal(branchAndBoundTime), "ms, Hiệu quả", -roundToOneDecimal(branchAndBoundEfficiency));

        const startBeam = performance.now();
        const resultBeam = beamSearch(slot, need);
        const beamTime = performance.now() - startBeam;
        totalBeamTime += beamTime;
        const beamEfficiency = missingHours2(slot, need, resultBeam);
        totalBeamEfficiency += beamEfficiency;
        console.log("Beam Search      - Thời gian:", roundToOneDecimal(beamTime), "ms, Hiệu quả:", -roundToOneDecimal(beamEfficiency));

        const startGreedy = performance.now();
        const resultGreedy = greedySchedule(slot, need);
        const greedyTime = performance.now() - startGreedy;
        totalGreedyTime += greedyTime;
        const greedyEfficiency = missingHours2(slot, need, resultGreedy);
        totalGreedyEfficiency += greedyEfficiency;
        console.log("Greedy           - Thời gian:", roundToOneDecimal(greedyTime), "ms, Hiệu quả:", -roundToOneDecimal(greedyEfficiency));

        const startRandom = performance.now();
        const resultRandom = randomSchedule(slot, need);
        const randomTime = performance.now() - startRandom;
        totalRandomTime += randomTime;
        const randomEfficiency = missingHours2(slot, need, resultRandom);
        totalRandomEfficiency += randomEfficiency;
        console.log("Randomized       - Thời gian:", roundToOneDecimal(randomTime), "ms, Hiệu quả:", -roundToOneDecimal(randomEfficiency));

        const startTurn = performance.now();
        const resultTurn = turnSchedule(slot, need);
        const turnTime = performance.now() - startTurn;
        totalTurnTime += turnTime;
        const turnEfficiency = missingHours2(slot, need, resultTurn);
        totalTurnEfficiency += turnEfficiency;
        console.log("Turn-based       - Thời gian:", roundToOneDecimal(turnTime), "ms, Hiệu quả:", -roundToOneDecimal(turnEfficiency));
    }

    // Tính trung bình
    console.log("=== KẾT QUẢ TRUNG BÌNH ===");
    console.log("Branch and Bound - Thời gian:", roundToOneDecimal(totalBranchAndBoundTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalBranchAndBoundEfficiency/numTests));
    console.log("Beam Search      - Thời gian:", roundToOneDecimal(totalBeamTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalBeamEfficiency/numTests));
    console.log("Greedy           - Thời gian:", roundToOneDecimal(totalGreedyTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalGreedyEfficiency/numTests));
    console.log("Randomized       - Thời gian:", roundToOneDecimal(totalRandomTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalRandomEfficiency/numTests));
    console.log("Turn-based       - Thời gian:", roundToOneDecimal(totalTurnTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalTurnEfficiency/numTests));
}
