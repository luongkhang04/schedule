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

// Lưu lịch học vào Local Storage
function saveToBrowser() {
    localStorage.setItem("slots", JSON.stringify(slots));
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("schedule", JSON.stringify(schedule));
}

// Nhập lịch học từ Local Storage
function importFromBrowser() {
    slots = JSON.parse(localStorage.getItem("slots"));
    subjects = JSON.parse(localStorage.getItem("subjects"));
    schedule = JSON.parse(localStorage.getItem("schedule"));
    updateSlotTable();
    updateSubjectTable();
    updateScheduleTable();
}

// Xuất lịch ra PDF
function printToPDF() {
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
                    padding: 20px 0 40px 0;
                }
                h1 {
                    margin: 0.5rem 0 0 0;
                    font-size: 2rem;
                }
                table {
                    width: 90%;
                    margin: auto;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th, td {
                    padding: 15px;
                    text-align: center;
                }
                thead {
                    background-color: #f4b084;
                    border-top: 0.5px solid #f4b084;
                    border-bottom: 0.5px solid #f4b084;
                }
                tr:nth-child(even) {
                    background-color: #ffeadd;
                    border-top: 0.5px solid #ffeadd;
                    border-bottom: 0.5px solid #ffeadd;
                }
            </style>
        </head>
        <body>
            <header>
                <img height="70" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAF42lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDYgNzkuMTY0NzUzLCAyMDIxLzAyLzE1LTExOjUyOjEzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMyAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDI0LTEyLTE1VDEyOjQwOjA2KzA3OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyNC0xMi0xNlQxNjo1NjoyNyswNzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyNC0xMi0xNlQxNjo1NjoyNyswNzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxZDdiNzVkZi01ODEyLTcyNGEtYmRkOS0zM2M2M2NmZWE4M2Ui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"/>
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
        </body>
        </html>
    `;

    // Mở một cửa sổ/tab mới
    const newWindow = window.open("", "_blank");

    // Ghi nội dung HTML vào cửa sổ mới
    newWindow.document.open();
    newWindow.document.write(htmlContent);
    newWindow.document.close();

    // Chờ nội dung tải xong, sau đó gọi print
    newWindow.onload = () => {
        newWindow.print();
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