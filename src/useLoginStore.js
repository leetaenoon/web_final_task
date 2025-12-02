import { create } from "zustand";
const useLoginStore = create((set) => ({
  userName: null, // 사용자 정보 (null이면 로그인 안 된 상태)
  isLoggedIn: false, //로그인이 완료되면 true로 변경 //actions
  logined: (displayName) =>
    set({
      userName: displayName,
      isLogined: true,
    }),
  logouted: () =>
    set({
      userName: null,
      isLogined: false,
    }),
}));
export default useLoginStore;
