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
    sortSlots(); // Sắp xếp ca học
    updateSlotTable();
}

function calculateDuration(start, end) {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    return (endHour + endMinute / 60) - (startHour + startMinute / 60);
}

function updateSlotTable() {
    const tableBody = document.getElementById('slot-table-body');
    tableBody.innerHTML = '';
    slots.forEach((slot, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${slot.day}</td>
                <td>${slot.start}</td>
                <td>${slot.end}</td>
                <td><button onclick="deleteSlot(${index})" class="btn btn-danger btn-sm">Xóa</button></td>
            </tr>
        `;
    });
}

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

function updateSubjectTable() {
    const tableBody = document.getElementById('subject-table-body');
    tableBody.innerHTML = '';
    subjects.forEach((subject, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${subject.name}</td>
                <td>${subject.hoursNeeded.toFixed(1)}</td>
                <td>${subject.hoursScheduled.toFixed(1)}</td>
                <td><button onclick="deleteSubject(${index})" class="btn btn-danger btn-sm">Xóa</button></td>
            </tr>
        `;
    });
}

function deleteSubject(index) {
    subjects.splice(index, 1);
    updateSubjectTable();
}

function generateSchedule() {
    subjects.forEach(subject => {
        subject.hoursScheduled = 0; // Đặt lại số giờ đã xếp thành 0
    });

    schedule = [];
    const remainingSubjects = subjects.map(s => ({ ...s }));

    slots.forEach(slot => {
        if (remainingSubjects.length === 0) return;

        const subject = remainingSubjects[0];
        if (subject.hoursNeeded <= slot.duration) {
            schedule.push({
                day: slot.day,
                subject: subject.name,
                start: slot.start,
                end: calculateEndTime(slot.start, subject.hoursNeeded)
            });
            const index = subjects.findIndex(s => s.name === subject.name);
            subjects[index].hoursScheduled += subject.hoursNeeded;
            subject.hoursNeeded = 0;
            remainingSubjects.shift();
        } else {
            schedule.push({
                day: slot.day,
                subject: subject.name,
                start: slot.start,
                end: calculateEndTime(slot.start, slot.duration)
            });
            const index = subjects.findIndex(s => s.name === subject.name);
            subjects[index].hoursScheduled += slot.duration;
            subject.hoursNeeded -= slot.duration;
        }
    });

    sortSchedule(); // Sắp xếp lịch học
    updateSubjectTable();
    updateScheduleTable();
}

// Hàm cập nhật bảng lịch học
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
    const duration = (new Date(`1970-01-01T${end}`) - new Date(`1970-01-01T${start}`)) / 3600000;

    if (duration <= 0) {
        alert("Thời lượng không hợp lệ!");
        return;
    }

    // Cập nhật lịch học
    const previousSubject = schedule[index].subject;
    schedule[index] = { day, subject, start, end };

    // Cập nhật số giờ đã xếp cho các môn học
    subjects.forEach((s) => {
        if (s.name === previousSubject) {
            s.hoursScheduled -= duration; // Giảm giờ đã xếp của môn cũ
        }
        if (s.name === subject) {
            s.hoursScheduled += duration; // Cộng giờ đã xếp của môn mới
        }
    });

    // Cập nhật giao diện
    sortSchedule();
    updateScheduleTable();
    updateSubjectTable();
}

function calculateEndTime(start, duration) {
    const [startHour, startMinute] = start.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMinute + duration * 60;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}
