// Hàm tạo giá trị ngẫu nhiên phân phối đều
function randomUniform(min, max) {
    return Math.random() * (max - min) + min;
}

// Hàm làm tròn giá trị đến 1 chữ số thập phân
function roundToOneDecimal(num) {
    return Math.round(num * 10) / 10;
}

// Hàm tạo input ngẫu nhiên với điều kiện số need <= số slot
function generateBalancedInput() {
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

// Hàm tính giá trị thiếu giờ
function missingHoursTest(slot, need, result) {
    const numSubject = need.length;
    result.forEach((choice, index)=>{
        if (choice<numSubject)
            need[choice] -= slot[index];
    });
    return need.reduce((missing, s) => missing + Math.max(s, 0), 0);
}

// Hàm kiểm thử với numTests input ngẫu nhiên
function testWithRandomInputs(numTests) {
    let totalGreedyTime = 0, totalTurnTime = 0, totalBranchAndBoundTime = 0, totalRandomTime = 0;
    let totalGreedyEfficiency = 0, totalTurnEfficiency = 0, totalBranchAndBoundEfficiency = 0, totalRandomEfficiency = 0;

    for (let i = 0; i < numTests; i++) {
        // Tạo input ngẫu nhiên với điều kiện số need <= số slot
        const { slot, need } = generateBalancedInput();

        // Tính thời gian thực thi và hiệu quả cho từng thuật toán
        const startBranchAndBound = performance.now();
        const resultBranchAndBound = optimalSchedule(slot, structuredClone(need));
        branchAndBoundTime = performance.now() - startBranchAndBound;
        totalBranchAndBoundTime += branchAndBoundTime;
        console.log(roundToOneDecimal(branchAndBoundTime));
        totalBranchAndBoundEfficiency += missingHoursTest(slot, structuredClone(need), resultBranchAndBound);

        const startRandom = performance.now();
        const resultRandom = randomSchedule(slot, structuredClone(need));
        totalRandomTime += performance.now() - startRandom;
        totalRandomEfficiency += missingHoursTest(slot, structuredClone(need), resultRandom);

        const startGreedy = performance.now();
        const resultGreedy = greedySchedule(slot, structuredClone(need));
        totalGreedyTime += performance.now() - startGreedy;
        totalGreedyEfficiency += missingHoursTest(slot, structuredClone(need), resultGreedy);

        const startTurn = performance.now();
        const resultTurn = turnSchedule(slot, structuredClone(need));
        totalTurnTime += performance.now() - startTurn;
        totalTurnEfficiency += missingHoursTest(slot, structuredClone(need), resultTurn);
    }

    // Tính trung bình
    console.log("=== Kết quả trung bình ===");
    console.log("Branch and Bound - Thời gian:", roundToOneDecimal(totalBranchAndBoundTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalBranchAndBoundEfficiency/numTests));
    console.log("Randomized - Thời gian:", roundToOneDecimal(totalRandomTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalRandomEfficiency/numTests));
    console.log("Greedy - Thời gian:", roundToOneDecimal(totalGreedyTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalGreedyEfficiency/numTests));
    console.log("Turn-based - Thời gian:", roundToOneDecimal(totalTurnTime/numTests), "ms, Hiệu quả:", -roundToOneDecimal(totalTurnEfficiency/numTests));
}
