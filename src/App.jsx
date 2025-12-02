// src/App.jsx
import React, { useEffect } from "react";
import "./App.css";
// 1. Link 컴포넌트 추가 (NavLink 옆에 Link 추가)
import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "./firebaseConfig";

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
      {/* 2. 헤더 텍스트를 Link로 감싸서 클릭 시 홈으로 이동하도록 설정 */}
      {/* textDecoration: "none"으로 밑줄 제거, color: "inherit"로 기존 색상 유지 */}
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
        <NavLink to="/login" className="nav-item">
          Login
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/photos" element={<Photos />}></Route>
        <Route path="/tour" element={<Tour />}></Route>
        <Route path="/editTrip/:docId" element={<EditTrip />} />
        <Route path="/login" element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
