# Design Token Guidelines

Chào mừng bạn đến với **Design Token Manager Portal**. Đây là Single Source of Truth (SSOT) cho toàn bộ hệ thống thiết kế của chúng ta.

## 🚀 Nguyên tắc sử dụng
1. **Không hardcode màu sắc:** Luôn sử dụng CSS Variables (e.g. `var(--brandPrimary)`).
2. **Tuân thủ phân cấp:** 
   - **Global:** Các giá trị nguyên tử (Primitives).
   - **Client:** Các bí danh ngữ nghĩa (Semantic Aliases).
   - **Project:** Các giá trị ghi đè cụ thể cho ứng dụng.

## 🎨 WCAG Compliance
Toàn bộ màu sắc trong hệ thống đều được kiểm định qua chuẩn **WCAG 2.1** và **APCA (WCAG 3.0)** để đảm bảo tính bao hàm (Accessibility).
