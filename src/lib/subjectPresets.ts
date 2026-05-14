// Danh sách môn học HNUE - Ngành Tiếng Anh
// Đã loại bỏ môn Thể chất (PHYE*) và Quốc phòng (DEFE*)
export interface SubjectPreset {
  code: string;
  name: string;
  credits: number;
  semester?: string;
}

export const SUBJECT_PRESETS: SubjectPreset[] = [
  // Học kỳ 1
  { code: 'COMM103', name: 'Nhập môn KHXH và nhân văn', credits: 2, semester: 'HK1' },
  { code: 'COMM105', name: 'Cơ sở văn hóa Việt Nam', credits: 2, semester: 'HK1' },
  { code: 'ENGL111', name: 'Phát triển kĩ năng nghe-nói 1', credits: 3, semester: 'HK1' },
  { code: 'ENGL112', name: 'Phát triển kĩ năng đọc-viết 1', credits: 3, semester: 'HK1' },
  { code: 'MATH137', name: 'Thống kê xã hội học', credits: 2, semester: 'HK1' },
  { code: 'PHIS105', name: 'Triết học Mác-Lênin', credits: 3, semester: 'HK1' },
  { code: 'PSYC101', name: 'Tâm lí học giáo dục', credits: 4, semester: 'HK1' },
  { code: 'CHIN105', name: 'Tiếng Trung 1', credits: 3, semester: 'HK1' },
  { code: 'COMM106', name: 'Tiếng Việt thực hành', credits: 2, semester: 'HK1' },
  { code: 'COMM107', name: 'Nghệ thuật đại cương', credits: 2, semester: 'HK1' },
  { code: 'FREN104', name: 'Tiếng Pháp 1', credits: 3, semester: 'HK1' },
  // Học kỳ 2
  { code: 'COMM108', name: 'Nhân học đại cương', credits: 2, semester: 'HK2' },
  { code: 'COMM109', name: 'Xã hội học đại cương', credits: 2, semester: 'HK2' },
  { code: 'COMM110', name: 'Lịch sử văn minh thế giới', credits: 2, semester: 'HK2' },
  { code: 'ENGL113', name: 'Phát triển kĩ năng nghe-nói 2', credits: 3, semester: 'HK2' },
  { code: 'ENGL115', name: 'Phát triển kĩ năng đọc-viết 2', credits: 3, semester: 'HK2' },
  { code: 'POLI104', name: 'Kinh tế chính trị Mác-Lênin', credits: 2, semester: 'HK2' },
  { code: 'POLI106', name: 'Chủ nghĩa xã hội khoa học', credits: 2, semester: 'HK2' },
  { code: 'CHIN106', name: 'Tiếng Trung 2', credits: 3, semester: 'HK2' },
  { code: 'FREN106', name: 'Tiếng Pháp 2', credits: 3, semester: 'HK2' },
  // Học kỳ 3
  { code: 'ENGL237', name: 'Ngôn ngữ học Tiếng Anh 1', credits: 3, semester: 'HK3' },
  { code: 'ENGL238', name: 'Phát triển kĩ năng nghe-nói 3', credits: 3, semester: 'HK3' },
  { code: 'ENGL239', name: 'Phát triển kĩ năng đọc-viết 3', credits: 3, semester: 'HK3' },
  { code: 'ENGL241', name: 'Phát triển kĩ năng nghe-nói 4', credits: 3, semester: 'HK3' },
  { code: 'ENGL242', name: 'Phát triển kĩ năng đọc-viết 4', credits: 3, semester: 'HK3' },
  { code: 'ENGL370', name: 'Kĩ năng phát biểu trước công chúng', credits: 3, semester: 'HK3' },
  { code: 'POLI202', name: 'Tư tưởng Hồ Chí Minh', credits: 2, semester: 'HK3' },
  // Học kỳ 4
  { code: 'POLI204', name: 'Lịch sử Đảng Cộng sản Việt Nam', credits: 2, semester: 'HK4' },
  { code: 'COMP105', name: 'Phát triển năng lực số', credits: 2, semester: 'HK4' },
  // Học kỳ 5
  { code: 'ENGL350', name: 'Phát triển kĩ năng nghe-nói 6', credits: 2, semester: 'HK5' },
  { code: 'ENGL351', name: 'Phát triển kĩ năng đọc-viết 6', credits: 2, semester: 'HK5' },
  // Học kỳ 6
  { code: 'ENGL245', name: 'Ngôn ngữ học Tiếng Anh 2', credits: 3, semester: 'HK6' },
  { code: 'ENGL329', name: 'Ngữ dụng học', credits: 3, semester: 'HK6' },
  { code: 'ENGL352', name: 'Nhập môn phiên dịch', credits: 3, semester: 'HK6' },
  { code: 'ENGL360', name: 'Thực hành biên dịch', credits: 3, semester: 'HK6' },
  { code: 'ENGL446', name: 'Ngôn ngữ học xã hội', credits: 3, semester: 'HK6' },
  // Học kỳ 7
  { code: 'ENGL359', name: 'Nhập môn biên dịch', credits: 3, semester: 'HK7' },
  { code: 'ENGL361', name: 'Thực hành phiên dịch', credits: 3, semester: 'HK7' },
  { code: 'ENGL362', name: 'Ngữ pháp chức năng', credits: 3, semester: 'HK7' },
  // Học kỳ 8
  { code: 'ENGL355', name: 'Văn học Anh-Mỹ', credits: 3, semester: 'HK8' },
  { code: 'ENGL450', name: 'Phát triển kĩ năng nghề nghiệp', credits: 3, semester: 'HK8' },
  // Chưa phân học kỳ / Tự chọn
  { code: 'ENGL215', name: 'Tiếng Anh trong giao dịch thương mại', credits: 3 },
  { code: 'ENGL236', name: 'Văn hóa - Văn minh Anh - Mỹ', credits: 3 },
  { code: 'ENGL340', name: 'Phân tích diễn ngôn', credits: 3 },
  { code: 'ENGL364', name: 'Phát triển kĩ năng nghe-nói 5', credits: 3 },
  { code: 'ENGL365', name: 'Phát triển kĩ năng đọc-viết 5', credits: 3 },
  { code: 'ENGL452', name: 'Ngôn ngữ học khối liệu', credits: 3 },
  { code: 'ENGL345', name: 'Tiếng Anh viết khoa học', credits: 3 },
  { code: 'ENGL4996', name: 'Khoá luận tốt nghiệp', credits: 6 },
];

export const SEMESTER_LABELS: Record<string, string> = {
  'HK1': 'Học kỳ 1', 'HK2': 'Học kỳ 2', 'HK3': 'Học kỳ 3',
  'HK4': 'Học kỳ 4', 'HK5': 'Học kỳ 5', 'HK6': 'Học kỳ 6',
  'HK7': 'Học kỳ 7', 'HK8': 'Học kỳ 8',
};
