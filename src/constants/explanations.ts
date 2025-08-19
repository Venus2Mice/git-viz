export const explanations = {
  INITIAL: "Đây là kho git của bạn. Mỗi commit là một snapshot của dự án. Nhấp vào các nút để thực hiện các lệnh git.",
  COMMIT: "git commit: Tạo một snapshot mới. Mỗi commit có một ID duy nhất và trỏ đến (các) commit cha, tạo nên một lịch sử.",
  BRANCH: "git branch <tên>: Tạo một con trỏ mới (nhánh) đến một commit. Nhánh cho phép bạn phát triển các tính năng một cách cô lập.",
  CHECKOUT: "git checkout <tên>: Chuyển HEAD sang một nhánh khác hoặc một commit cụ thể. HEAD chỉ định vị trí commit tiếp theo sẽ được tạo.",
  CHECKOUT_COMMIT: "Detached HEAD: HEAD đang trỏ trực tiếp đến một commit thay vì một nhánh. Các commit mới sẽ không thuộc bất kỳ nhánh nào.",
  MERGE: "git merge <tên>: Kết hợp các thay đổi từ một nhánh khác vào nhánh hiện tại (HEAD). Một commit hợp nhất mới với hai cha được tạo ra.",
  MERGE_FF: "Fast-Forward Merge: Vì không có commit nào khác trên nhánh đích, git chỉ cần di chuyển con trỏ của nhánh về phía trước. Không cần commit hợp nhất.",
  TAG: "git tag <tên>: Tạo một con trỏ cố định đến một commit cụ thể, thường được sử dụng để đánh dấu các phiên bản phát hành (v1.0).",
  REVERT: "git revert HEAD: Tạo một commit mới để hoàn tác các thay đổi được thực hiện bởi commit trước đó. Lịch sử được thêm vào, không bị thay đổi.",
  REBASE: "git rebase <base>: Di chuyển toàn bộ nhánh hiện tại để bắt đầu từ đỉnh của một nhánh khác. Nó viết lại lịch sử commit để tạo ra một luồng công việc tuyến tính.",
  RESET: "git reset <commit>: Di chuyển con trỏ của nhánh hiện tại (HEAD) về một commit cụ thể. Lệnh này viết lại lịch sử bằng cách loại bỏ các commit khỏi chuỗi lịch sử của nhánh, nhưng không xóa chúng. Chúng trở thành commit 'mồ côi' nếu không có nhánh nào khác trỏ đến chúng."
};