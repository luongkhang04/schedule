let slots = [];
let subjects = [];
let schedule = [];

// Thứ tự các ngày trong tuần
const dayOrder = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

// Hàm sắp xếp danh sách ca học theo thứ tự ngày và thời gian
function sortSlots() {
    slots.sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff; // Sắp xếp theo thứ
        return a.start.localeCompare(b.start); // Sắp xếp theo thời gian bắt đầu
    });
}

// Hàm tính thời lượng
function calculateDuration(start, end) {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    return (endHour + endMinute / 60) - (startHour + startMinute / 60);
}

// Thêm ca 
function addSlot() {
    const day = document.getElementById('day').value;
    const start = document.getElementById('start-time').value;
    const end = document.getElementById('end-time').value;

    if (start >= end) {
        alert('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!');
        return;
    }

    for (const slot of slots) {
        if (slot.day === day &&
            ((start >= slot.start && start < slot.end) || (end > slot.start && end <= slot.end) || (start <= slot.start && end >= slot.end))) {
            alert('Ca học bị trùng lặp!');
            return;
        }
    }

    slots.push({ day, start, end });
    sortSlots();
    updateSlotTable();
}

// Cập nhật giao diện các ca 
function updateSlotTable() {
    const tableBody = document.getElementById('slot-table-body');
    tableBody.innerHTML = '';
    
    let totalTime = 0; // Khởi tạo biến để tính tổng thời gian

    slots.forEach((slot, index) => {
        const duration = calculateDuration(slot.start, slot.end);
        totalTime += duration; // Cộng dồn thời gian của các ca học

        tableBody.innerHTML += `
            <tr>
                <td>${slot.day}</td>
                <td>${slot.start}</td>
                <td>${slot.end}</td>
                <td>
                    <button onclick="deleteSlot(${index})" class="btn btn-danger btn-sm" title="Xóa">
                        <img src="trash.svg" alt="Xóa">
                    </button>
                </td>
            </tr>
        `;
    });

    // Hiển thị tổng thời gian học trong tuần
    document.getElementById('total-study-time').textContent = totalTime.toFixed(1);
}

// Xóa ca 
function deleteSlot(index) {
    slots.splice(index, 1);
    updateSlotTable();
}

//Thêm môn học
function addSubject() {
    const name = document.getElementById('subject-name').value.trim();
    const hoursNeeded = parseFloat(document.getElementById('hours-needed').value);

    if (!name || hoursNeeded <= 0) {
        alert('Tên môn học và số giờ cần học phải hợp lệ!');
        return;
    }

    if (subjects.some(subject => subject.name.toLowerCase() === name.toLowerCase())) {
        alert('Môn học đã tồn tại!');
        return;
    }

    subjects.push({ name, hoursNeeded, hoursScheduled: 0 });
    updateSubjectTable();
}

// Cập nhật giao diện bảng các môn 
function updateSubjectTable() {
    const tableBody = document.getElementById('subject-table-body');
    tableBody.innerHTML = '';
    let totalTimeNeeded = 0;
    let totalTimeScheduled = 0;
    subjects.forEach((subject, index) => {
        subject.hoursScheduled = 0;
        schedule.forEach((s)=>{
            if (s.subject == subject.name)
                subject.hoursScheduled += calculateDuration(s.start, s.end);
        });
        tableBody.innerHTML += `
            <tr data-index="${index}">
                <td>${subject.name}</td>
                <td>${subject.hoursNeeded.toFixed(1)}</td>
                <td>${subject.hoursScheduled.toFixed(1)}</td>
                <td>
                    <button onclick="deleteSubject(this)" class="btn btn-danger btn-sm" title="Xóa">
                        <img src="trash.svg" alt="Xóa">
                    </button>
                    <button class="btn btn-info btn-sm handle" title="Di chuyển">
                        <img src="move.svg" alt="Di chuyển">
                    </button>
                </td>
            </tr>
        `;
        totalTimeNeeded += subject.hoursNeeded;
        totalTimeScheduled += subject.hoursScheduled;
    });
    document.getElementById('totalTimeNeeded').textContent = totalTimeNeeded.toFixed(1);
    document.getElementById('totalTimeScheduled').textContent = totalTimeScheduled.toFixed(1);
}

// Xóa môn 
function deleteSubject(element) {
    const index = element.parentNode.parentNode.getAttribute("data-index");
    subjects.splice(index, 1);
    updateSubjectTable();
}

// Xếp lịch 
function generateSchedule() {
    schedule = [];
    const slot = slots.map(s => (calculateDuration(s.start, s.end)));
    const need = subjects.map(s => (s.hoursNeeded));
    const sort = document.getElementById('sort').value;
    let select = [];
    if (sort == "optimal") 
        select = optimalSchedule(slot, need);
    else if (sort == "random")
        select = randomSchedule(slot, need);
    else if (sort == "greedy")
        select = greedySchedule(slot, need);
    else if (sort == "turn")
        select = turnSchedule(slot, need);
    select.forEach((choice, index) => {
        if (choice < subjects.length) {
            schedule.push({
                    day: slots[index].day,
                    subject: subjects[choice].name,
                    start: slots[index].start,
                    end: slots[index].end
                });
        }
    });
    updateScheduleTable();
    updateSubjectTable();
}

// Thuật toán nhánh cận
function optimalSchedule(slot, need) {
    let select = [];
    let result = [];
    let min = Infinity;
    // Hàm mục tiêu: số giờ còn thiếu
    function missingHours(){
        let missing = 0;
        need.forEach((s)=>{
            missing += Math.max(s,0); 
        });
        return missing;
    }
    // Cận dưới
    function lowerBound(){
        let unscheduled = 0;
        for (let i=select.length; i<slot.length; i++)
            unscheduled += slot[i];
        return missingHours() - unscheduled;
    }
    // Hàm đệ quy
    function BranchAndBound() {
        if (select.length == slot.length) {
            let f = missingHours(need);
            if (f < min) {
                min = f;
                result = select.map((s)=>(s));
            }
            if (min == 0)
                return 0;
        } else {
            for (let i=0; i<=need.length; i++) {
                select.push(i);
                if (i != need.length)
                    need[i] -= slot[select.length-1];
                if (lowerBound() < min)
                    if (BranchAndBound()==0)
                        return 0;
                if (i != need.length)
                    need[i] += slot[select.length-1];
                select.pop();
            }
        }
    }
    BranchAndBound();
    return result;
}

// Sắp xếp ngẫu nhiên
function randomSchedule(slot, need) {
    // xếp ngẫu nhiên các slot
    const randomIndex = [];
    for (let i=0; i<slot.length; i++)
        randomIndex.push(i);
    randomIndex.sort(() => (0.5 - Math.random()));
    const randomSlot = [];
    randomIndex.forEach((index) => {
        randomSlot.push(slot[index]);
    });

    const select = greedySchedule(randomSlot, need);
    // trả về thứ tự ban đầu
    const result = [];
    randomIndex.forEach((random, index) => {
        result[random] = select[index];
    });
    return result;
}

// Thuật toán tham lam
function greedySchedule(slot, need) {
    const select = [];
    slot.forEach((s) => {
        let indexOfMax = 0;
        need.forEach((hoursNeeded, index) => {
            if (hoursNeeded > need[indexOfMax])
                indexOfMax = index;
        });
        if (need[indexOfMax] > 0) {
            select.push(indexOfMax);
            need[indexOfMax] -= s;
        } else
            select.push(need.length);
    });
    return select;
}

// Sắp xếp lần lượt
function turnSchedule(slot, need) {
    const select = [];
    let index = 0;
    slot.forEach((s) => {
        if (index == need.length)
            select.push(index);
        else {
            select.push(index);
            need[index] -= s;
            if (need[index] <= 0)
                index++;
        }
    });
    return select;
}

// Cập nhật giao diện bảng lịch học
function updateScheduleTable() {
    const table = document.getElementById("schedule-table-body");
    table.innerHTML = "";
    schedule.forEach((entry, index) => {
        table.innerHTML += `
            <tr>
                <td>${entry.day}</td>
                <td>${entry.subject}</td>
                <td>${entry.start}</td>
                <td>${entry.end}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editScheduleEntry(${index})" title="Chỉnh sửa">
                        <img src="edit.svg" alt="Chỉnh sửa">
                    </button>
                </td>
            </tr>
        `;
    });
}

function getSubjectOptions(selectedSubject = "") {
    return subjects
        .map(
            (subject) =>
                `<option value="${subject.name}" ${
                    subject.name === selectedSubject ? "selected" : ""
                }>${subject.name}</option>`
        )
        .join("");
}

// Hàm chuyển dòng lịch học sang chế độ chỉnh sửa
function editScheduleEntry(index) {
    const table = document.getElementById("schedule-table-body");
    const row = table.children[index];
    const entry = schedule[index];

    row.innerHTML = `
        <td>${entry.day}</td>
        <td>
            <select id="edit-subject-${index}" class="form-select">
                ${getSubjectOptions(entry.subject)}
            </select>
        </td>
        <td>${entry.start}</td>
        <td>${entry.end}</td>
        <td>
            <button class="btn btn-success btn-sm" onclick="saveScheduleEntry(${index})" title="Lưu">
                <img src="save.svg" alt="Lưu">
            </button>
        </td>
    `;
}

// Hàm lưu thay đổi sau khi chỉnh sửa
function saveScheduleEntry(index) {
    schedule[index].subject = document.getElementById(`edit-subject-${index}`).value;

    // Cập nhật giao diện
    updateScheduleTable();
    updateSubjectTable();
}

// Xuất lịch ra PDF
function exportScheduleToPDF() {
    // Lấy dữ liệu từ bảng (bỏ cột "Chỉnh sửa")
    const table = document.getElementById("schedule-table-body");
    const rows = Array.from(table.children).map((row) => {
        return Array.from(row.children)
            .slice(0, -1) // Loại bỏ cột cuối cùng (Chỉnh sửa)
            .map((cell) => cell.textContent.trim());
    });

    // Tạo nội dung HTML cho trang in
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lịch Học Cá Nhân</title>
            <style>
                body {
                    font-family: 'Roboto', sans-serif;
                    margin: 0;
                    padding: 0;
                }
                header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 2px solid #ccc;
                    margin-bottom: 20px;
                }
                h1 {
                    margin: 0;
                    color: #333;
                    font-size: 24px;
                }
                footer {
                    text-align: center;
                    font-size: 12px;
                    margin-top: 20px;
                    padding: 10px;
                    border-top: 2px solid #ccc;
                    color: #666;
                }
                table {
                    width: 90%;
                    margin: auto;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: center;
                }
                th {
                    background-color: #f4b084;
                    color: #000;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f1f1f1;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>Lịch Học Cá Nhân</h1>
            </header>
            <table>
                <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Môn học</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows
                        .map(
                            (row) => `
                        <tr>
                            ${row.map((cell) => `<td>${cell}</td>`).join("")}
                        </tr>`
                        )
                        .join("")}
                </tbody>
            </table>
            <footer>
                <p>© 2024 - Ứng dụng xếp lịch học. Xuất bản bởi Lương Thái Khang.</p>
            </footer>
        </body>
        </html>
    `;

    // Mở một cửa sổ/tab mới
    const newWindow = window.open("0", "_blank");

    // Ghi nội dung HTML vào cửa sổ mới
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();

    // Chờ nội dung tải xong, sau đó gọi print
    newWindow.onload = () => {
        newWindow.print();
        newWindow.close();
    };
}

// Tích hợp drag-and-drop với Sortable.js
const subjectTableBody = document.getElementById("subject-table-body");
Sortable.create(subjectTableBody, {
    animation: 150, // Hiệu ứng mượt khi kéo
    handle: '.handle',   // Kéo cả hàng
    onSort: function () {
        // Cập nhật lại mảng subjects khi thay đổi thứ tự
        const newSubjects = [];
        document.querySelectorAll("#subject-table-body tr").forEach((tr, i) => {
            const index = tr.getAttribute("data-index");
            newSubjects.push(subjects[index]);
            tr.setAttribute("data-index", i);
        });
        subjects = newSubjects; // Đồng bộ lại mảng subjects
    },
});