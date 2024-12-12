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

// Hàm sắp xếp lịch học theo thứ tự ngày và thời gian
function sortSchedule() {
    schedule.sort((a, b) => {
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

    slots.push({ day, start, end, duration: calculateDuration(start, end) });
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
                <td><button onclick="deleteSlot(${index})" class="btn btn-danger btn-sm">Xóa</button></td>
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
        totalTimeNeeded += subject.hoursNeeded;
        totalTimeScheduled += subject.hoursScheduled;
        tableBody.innerHTML += `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.hoursNeeded.toFixed(1)}</td>
                <td>${subject.hoursScheduled.toFixed(1)}</td>
                <td><button onclick="deleteSubject(${index})" class="btn btn-danger btn-sm">Xóa</button></td>
            </tr>
        `;
    });
    document.getElementById('totalTimeNeeded').textContent = totalTimeNeeded.toFixed(1);
    document.getElementById('totalTimeScheduled').textContent = totalTimeScheduled.toFixed(1);
}

// Xóa môn 
function deleteSubject(index) {
    subjects.splice(index, 1);
    updateSubjectTable();
}

// Xếp lịch 
function generateSchedule() {
    subjects.forEach(subject => {
        subject.hoursScheduled = 0; // Đặt lại số giờ đã xếp thành 0
    });
    schedule = [];
    let tempSubjects = subjects.map(s => ({name: s.name, hoursNeeded: s.hoursNeeded}));
    let tempSlots = slots.map(s => ({...s}));
    const sort = document.getElementById("sort").value;
    if (sort == "random")
        tempSlots.sort(() => (0.5 - Math.random()));

    tempSlots.forEach(slot => {
        if (tempSubjects.length === 0) return;
        let i=0;
        if (sort == "turn") {
            for (let j = 0; j < tempSubjects.length; j++) {
                if (tempSubjects[j].hoursNeeded < tempSubjects[i].hoursNeeded)
                    i = j;
            }
        } else {
            for (let j = 0; j < tempSubjects.length; j++) {
                if (tempSubjects[j].hoursNeeded > tempSubjects[i].hoursNeeded)
                    i = j;
            }
        }
        const subject = tempSubjects[i];
        schedule.push({
                day: slot.day,
                subject: subject.name,
                start: slot.start,
                end: slot.end
            });
        const index = subjects.findIndex(s => s.name === subject.name);
        subjects[index].hoursScheduled += slot.duration;
        subject.hoursNeeded -= slot.duration;
        if (subject.hoursNeeded <= 0)
            tempSubjects.splice(i, 1);
    });

    sortSchedule(); // Sắp xếp lịch học
    updateSubjectTable();
    updateScheduleTable();
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
                <td><button class="btn btn-primary btn-sm" onclick="editScheduleEntry(${index})">Chỉnh sửa</button></td>
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
        <td>
            <select id="edit-day-${index}" class="form-select">
                ${dayOrder
                    .map(
                        (day) =>
                            `<option value="${day}" ${
                                day === entry.day ? "selected" : ""
                            }>${day}</option>`
                    )
                    .join("")}
            </select>
        </td>
        <td>
            <select id="edit-subject-${index}" class="form-select">
                ${getSubjectOptions(entry.subject)}
            </select>
        </td>
        <td>
            <input type="time" class="form-control" id="edit-start-${index}" value="${entry.start}" />
        </td>
        <td>
            <input type="time" class="form-control" id="edit-end-${index}" value="${entry.end}" />
        </td>
        <td>
            <button class="btn btn-success btn-sm" onclick="saveScheduleEntry(${index})">Lưu</button>
        </td>
    `;
}

// Hàm lưu thay đổi sau khi chỉnh sửa
function saveScheduleEntry(index) {
    const day = document.getElementById(`edit-day-${index}`).value;
    const subject = document.getElementById(`edit-subject-${index}`).value;
    const start = document.getElementById(`edit-start-${index}`).value;
    const end = document.getElementById(`edit-end-${index}`).value;

    if (start >= end) {
        alert("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!");
        return;
    }

    // Tính toán thời lượng
    const duration = calculateDuration(start, end);

    if (duration <= 0) {
        alert("Thời lượng không hợp lệ!");
        return;
    }

    // Cập nhật lịch học
    const previousEntry = schedule[index];
    const previousDuration = calculateDuration(previousEntry.start, previousEntry.end);
    schedule[index] = { day, subject, start, end };

    // Cập nhật số giờ đã xếp cho các môn học
    subjects.forEach((s) => {
        // Giảm số giờ đã xếp cho môn học cũ
        if (s.name === previousEntry.subject) {
            s.hoursScheduled -= previousDuration;
        }
        // Tăng số giờ đã xếp cho môn học mới
        if (s.name === subject) {
            s.hoursScheduled += duration;
        }
    });

    // Cập nhật giao diện
    sortSchedule();
    updateScheduleTable();
    updateSubjectTable();
}

function f(){
    let f=0;
    subjects.forEach((s) => {
        f += Math.max(s.hoursNeeded - s.hoursScheduled, 0);
    });
    return f;
}