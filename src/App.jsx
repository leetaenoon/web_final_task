// src/App.jsx
import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, NavLink } from "react-router";
// 1. 로그아웃 기능 import
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

  // 2. 로그아웃 핸들러 추가
  const handleLogout = () => {
    signOut(auth).then(() => {
      logouted();
      alert("로그아웃 되었습니다.");
    });
  };

  return (
    <BrowserRouter>
      <h1 className="header">Welcome to react & Firebase.</h1>

      {/* 3. 유저 이름과 로그아웃 버튼을 묶는 컨테이너 추가 */}
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
