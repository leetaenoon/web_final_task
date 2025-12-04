// src/App.jsx
import React, { useEffect, useState } from "react"; // useState 추가
import "./App.css";
import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "./firebaseConfig";

// 1. 이미지 임포트 (경로 확인: src/assets/images.png)
import univLogo from "./assets/images.png";

import Home from "./Home";
import Photos from "./Photos";
import Tour from "./Tour";
import EditTrip from "./EditTrip";
import Login from "./Login";
import useLoginStore from "./useLoginStore";

function App() {
  const isLogined = useLoginStore((state) => state.isLogined);
  const userName = useLoginStore((state) => state.userName);
  const logined = useLoginStore((state) => state.logined);
  const logouted = useLoginStore((state) => state.logouted);
  const auth = getAuth(app);

  // 2. FAB 메뉴 상태 추가
  const [showUnivLinks, setShowUnivLinks] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        logined(user.displayName);
      } else {
        logouted();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      logouted();
      alert("로그아웃 되었습니다.");
    });
  };

  return (
    <BrowserRouter>
      {/* 헤더 제목 클릭 시 홈으로 이동 */}
      <h1 className="header">
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
          }}
        >
          고급 웹프로그래밍 기말과제 여행기록부
        </Link>
      </h1>

      {/* 유저 정보 및 로그아웃 버튼 */}
      <div className="user-info-bar">
        {isLogined ? (
          <>
            <h4 className="user-name">{userName}</h4>
            <button className="logout-mini-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <h4>로그인되지 않은 상태</h4>
        )}
      </div>

      {/* 네비게이션 바 */}
      <nav className="navi">
        <NavLink to="/" className="nav-item">
          Home
        </NavLink>
        <NavLink to="/photos" className="nav-item">
          Photos
        </NavLink>
        <NavLink to="/tour" className="nav-item">
          여행등록
        </NavLink>

        {/* 로그인이 안 된 상태일 때만 Login 메뉴 표시 */}
        {!isLogined && (
          <NavLink to="/login" className="nav-item">
            Login
          </NavLink>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/photos" element={<Photos />}></Route>
        <Route path="/tour" element={<Tour />}></Route>
        <Route path="/editTrip/:docId" element={<EditTrip />} />
        <Route path="/login" element={<Login />}></Route>
      </Routes>

      {/* 3. 👇 모든 페이지에 표시될 플로팅 아이콘 (FAB) 추가 👇 */}
      <div className="fab-container">
        {showUnivLinks && (
          <div className="fab-menu">
            <a
              href="https://www.hs.ac.kr/kor/index.do"
              target="_blank"
              rel="noreferrer"
              className="univ-link"
            >
              한신대 홈페이지
            </a>
            <a
              href="https://hsctis.hs.ac.kr/app-nexa/index.html"
              target="_blank"
              rel="noreferrer"
              className="univ-link"
            >
              한신대 종합포털
            </a>
            <a
              href="https://lms.hs.ac.kr/main/MainView.dunet#main"
              target="_blank"
              rel="noreferrer"
              className="univ-link"
            >
              한신대 LMS
            </a>
          </div>
        )}
        <button
          className="fab-button"
          onClick={() => setShowUnivLinks(!showUnivLinks)}
        >
          <img src={univLogo} alt="Quick Menu" />
        </button>
      </div>
      {/* 👆 플로팅 아이콘 추가 끝 👆 */}
    </BrowserRouter>
  );
}
export default App;
