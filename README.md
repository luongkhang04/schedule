# Ứng Dụng Xếp Lịch Học

## I. Chức năng chính
Ứng dụng xếp lịch học được thiết kế nhằm giúp người dùng tổ chức thời gian học tập hiệu quả, có chức năng chính là giải quyết bài toán xếp lịch học:
* Đầu vào:
  - Danh sách các ca học khả dụng mỗi tuần bao gồm:
    + Ngày học.
    + Thời gian bắt đầu và kết thúc.
  - Danh sách các môn học bao gồm:
    + Tên môn học.
    + Số giờ cần học.
* Đầu ra:
  - Lịch học hoàn chỉnh, bao gồm:
    + Ngày học.
    + Môn học.
    + Thời gian bắt đầu và kết thúc.
* Mục tiêu: Phân bổ đầy đủ số giờ cần học cho từng môn.

Danh sách các ca học:
| Ngày | Bắt đầu | Kết thúc |
| :-----: | :-----: | :-----: |
| Thứ Hai | 14:00 | 16:00 |
| Thứ Hai | 16:00 | 17:30 |
| Thứ Tư | 14:00 | 16:30 |
| Thứ Năm | 20:00 | 22:00 |
| Thứ Sáu | 08:00 | 10:30 |
| Thứ Bảy | 08:00 | 10:30 |

Danh sách các môn học:
| Môn học | Số giờ cần học |
| :-----: | :-----: |
| English | 2 |
| Giải tích | 5 |
| Mạng máy tính | 6 |

Lịch học theo tuần:
| Ngày | Môn học | Bắt đầu | Kết thúc |
| :-----: | :-----: | :-----: | :-----: |
| Thứ Hai | English | 14:00 | 16:00 |
| Thứ Hai | Mạng máy tính | 16:00 | 17:30 |
| Thứ Tư | Giải tích | 14:00 | 16:30 |
| Thứ Năm | Mạng máy tính | 20:00 | 22:00 |
| Thứ Sáu | Giải tích | 08:00 | 10:30 |
| Thứ Bảy | Mạng máy tính | 08:00 | 10:30 |

## II. Công nghệ sử dụng
Xây dựng ứng dụng web.
* Ngôn ngữ lập trình: HTML, CSS, JavaScript.
* Thư viện hỗ trợ:
  + Bootstrap: Tăng cường giao diện người dùng.
  + Sortable.js: Hỗ trợ kéo thả trong quản lý danh sách môn học.

## III. Các hàm xếp lịch học
* Đầu vào:
  + `slot`: một mảng chứa thời lượng các ca học
  + `need`: một mảng chứ số giờ cần học của các môn 
* Đầu ra:
  + Một mảng chứa chỉ số của môn học được xếp vào từng ca học
* Ví dụ
```
slot = [2, 1.5, 2.5, 2, 2.5, 2.5];
need = [2, 5, 6];
result = [0, 2, 1, 2, 1, 2];
```

### 1. Xếp lịch dùng thuật toán backtracking kết hợp nhánh cận
`optimalSchedule(slot, need)`
#### a) Ý tưởng chính
* Tìm kiếm toàn bộ không gian nghiệm của bài toán để tìm cách phân bổ lịch học tối ưu.
* Hàm mục tiêu: số giờ học còn thiếu (số giờ mà môn học yêu cầu nhưng chưa được phân bổ trong lịch)
* Sử dụng cận dưới để loại bỏ những nhánh không khả thi nhằm giảm không gian tìm kiếm.
#### b) Hoạt động
* Tại mỗi bước, thử phân bổ từng môn học vào một ca khả dụng.
* Tính cận dưới: số giờ học còn thiếu mà không thể bù đắp bằng các ca học còn lại.
* Nếu cận dưới lớn hơn số giờ thiếu hiện tại, loại bỏ nhánh này.
* Tiếp tục tìm kiếm các nhánh khác đến khi tìm được lời giải tối ưu.
#### c) Độ phức tạp
* Không gian tìm kiếm: $(n+1)^m$  
với $n$ là số môn học, $m$ là số ca học khả dụng.  
Tuy nhiên, sử dụng cận dưới giúp giảm đáng kể không gian tìm kiếm.

### 2. Xếp lịch dùng thuật toán tham lam
`greedySchedule(slot, need)`
#### a) Ý tưởng chính
* Tại mỗi ca học, chọn môn học có số giờ cần học chưa được phân bổ lớn nhất.
#### b) Hoạt động
* Lặp qua từng ca học.
* Phân bổ ca học cho môn có số giờ cần học lớn nhất.
* Giảm số giờ cần học của môn đó.
#### c) Độ phức tạp
* $O(n∙m)$, với $n$ là số môn học và $m$ là số lượng ca học.
 
### 3. Xếp lịch ngẫu nhiên
`randomSchedule(slot, need)`
* Xáo trộn ngẫu nhiên thứ tự các ca học, sau đó áp dụng thuật toán tham lam trên danh sách đã xáo trộn.
* Nhằm đa dạng hóa cách xếp lịch.
 
### 4. Xếp lịch dùng Beam Search
`beamSearch(slot, need, beamWidth = slot.length, restartThreshold = 3, maxIterations = 3*slot.length)`
#### a) Ý tưởng chính
* **Beam Search** tìm kiếm giải pháp bằng cách duy trì một số lượng giải pháp tốt nhất (`beamWidth`) tại mỗi bước, thay vì duyệt toàn bộ.
* **Random Restart Beam Search**: Nếu beam không cải thiện sau một số vòng lặp, khởi động lại beam với các giải pháp ngẫu nhiên mới.
#### b) Hoạt động
* Khởi tạo beam với các giải pháp ngẫu nhiên.
* Tạo lân cận của các giải pháp trong beam, đánh giá và chọn beamWidth giải pháp tốt nhất. (`beamWidth = số ca học`)
* Đếm số vòng lặp mà bestScore không thay đổi. Nếu đạt ngưỡng (*3 vòng lặp*), khởi động lại beam với một số giải pháp ngẫu nhiên.
* Lặp lại đến khi số vòng lặp tối đa (`maxIterations = 3*số ca học`) hoặc khi tìm được lời giải tối ưu.
#### c) Độ phức tạp
* $O(n^3∙m^2)$, với $n$ là số ca học, $m$ là số môn học.
 
### 5. Xếp lịch lần lượt từng môn
`turnSchedule(slot, need)`
#### a) Ý tưởng chính
* Phân bổ ca học theo thứ tự các môn, lặp lại khi hết danh sách môn.
#### b) Hoạt động
* Duyệt qua các ca học và lần lượt gán cho từng môn.
* Khi một môn học đã đủ số giờ, chuyển sang môn tiếp theo.
#### c) Độ phức tạp
* $O(n)$, với $n$ là số lượng ca học.

### 6. So sánh ý tưởng các thuật toán xếp lịch
| Thuật toán | Phức tạp | Ưu điểm | Nhược điểm |
| ----- | ----- | ----- | ----- |
| Nhánh cận | $O(n^m)$ | Lời giải tối ưu | Xử lý lâu nếu đầu vào lớn |
| Beam Search | $O(n^3∙m^2)$ | Nhanh, hiệu quả | Không đảm bảo tối ưu |
| Tham lam | $O(n∙m)$ | Nhanh, dễ triển khai | Không đảm bảo tối ưu |
| Ngẫu nhiên | $O(n∙m)$ | Tăng tính đa dạng | Không đảm bảo tối ưu |
| Lần lượt | $O(n)$ | Đơn giản, nhanh | Không hiệu quả |

## IV. Kiểm thử
### 1. Phương pháp kiểm thử
* Tạo dữ liệu kiểm thử ngẫu nhiên:
	+ Hàm `generateInput()` tạo danh sách các ca học (`slot`) và số giờ cần học (`need`).
	+ Đảm bảo tổng số giờ của ca học không chênh lệch quá nhiều so với tổng số giờ cần học.
* Đo lường thời gian và hiệu quả:
	+ `performance.now()` đo thời gian thực thi của mỗi thuật toán.
	+ Hiệu quả được tính bằng tổng số giờ còn thiếu (`missingHours`) sau khi áp dụng thuật toán.
* Kiểm thử lặp lại:
	+ Chạy kiểm thử với một số lượng lớn đầu vào ngẫu nhiên (`numTests`) để đánh giá độ tin cậy và tính ổn định.

### 2. Kết quả kiểm thử
Thực hiện kiểm thử với 1000 đầu vào ngẫu nhiên thu được kết quả trung bình như sau:

| Thuật toán | Thời gian | Hiệu quả |
| ----- | :-----: | :-----: |
| Nhánh cận | 120 ms | -0.6 |
| Beam Search | 6.5 ms | -0.7 |
| Tham lam | <0.1 ms | -2.2 |
| Ngẫu nhiên | <0.1 ms | -2.2 |
| Lần lượt | <0.1 ms | -5.0 |

### 3. Phân tích kết quả
**Thuật toán nhánh cận** đạt hiệu quả tối ưu (số giờ học còn thiếu thấp nhất), nhưng có thời gian thực thi lâu nhất. **Thuật toán Beam Search** nhanh hơn đáng kể, đạt hiệu quả cao. Ba thuật toán còn lại có thời gian thực thi rất nhanh nhưng không đạt hiệu quả cao.  
Đặc biệt, với một số đầu vào có số lượng ca học và môn học lớn (>16 ca học, >6 môn học) thì thời gian thực thi của thuật toán nhánh cận có thể lên đến hơn 4 giây, trong khi Beam Search thực hiện trong chưa tới 60ms.
![image](https://github.com/user-attachments/assets/a08d00c4-6beb-4004-98df-0ef97ff9bf48)
Như vậy, thuật toán nhánh cận là thuật toán phù hợp nhất khi yêu cầu tìm lời giải tối ưu và dữ liệu đầu vào nhỏ. Thuật toán Beam Search là lựa chọn tốt cho các bài toán lớn khi yêu cầu hiệu suất thời gian. 

## V. Hướng dẫn sử dụng
Link ứng dụng: [Ứng Dụng Xếp Lịch Học](https://luongkhang04.github.io/schedule/)
### Các bước xếp lịch
1. Nhập danh sách các ca học trong tuần
2. Nhập danh sách các môn cần học, số giờ cần học của từng môn
3. Chọn cách xếp lịch
   * Đảm bảo số giờ cần học (*dùng thuật toán nhánh cận*)
   * Xếp đan xen (*dùng thuật toán tham lam*)
   * Xếp ngẫu nhiên
   * Xếp ngẫu nhiên tối ưu (*dùng Beam Search*)
   * Xếp lần lượt
4. Bấm nút ***Xếp lịch***
5. Có thể lưu lại lịch đã xếp vào trình duyệt hoặc in lịch học, lưu dưới dạng PDF
> [!TIP]
> ***Tổng thời gian có thể học*** và ***Tổng thời gian cần học*** giúp bạn cân đối thời gian dễ dàng hơn
### Chạy kiểm thử
Mở ***Console*** của trình duyệt và chạy lệnh sau
```
testWithRandomInputs(100)
```
