//App.jsx
//import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, NavLink } from "react-router";
import Home from "./Home";
import Photos from "./Photos";
import Tour from "./Tour";
import EditTrip from "./EditTrip";
import Login from "./Login";
import useLoginStore from "./useLoginStore"; //로그인상태및username 구독
function App() {
  //let [isLogined] = useRecoilState(loginAtom);
  //이 방식으로 상태값을 얻어서 사용할 수 있음
  // let isLogined = useRecoilValue(loginAtom);
  const isLogined = useLoginStore((state) => state.isLogined);
  const userName = useLoginStore((state) => state.userName);
  return (
    <BrowserRouter>
      <h1 className="header">Welcome to react & Firebase.</h1>{" "}
      <h4>{isLogined ? userName : "로그인되지 않은 상태"}</h4>{" "}
      <nav className="navi">
        {" "}
        <NavLink to="/" className="nav-item">
          Home{" "}
        </NavLink>{" "}
        <NavLink to="/photos" className="nav-item">
          Photos{" "}
        </NavLink>{" "}
        <NavLink to="/tour" className="nav-item">
          여행등록{" "}
        </NavLink>
        {/* 아래는 네비 링크에는 포함시키지 않고 구현하였음*/}{" "}
        {/* <NavLink to="editTrip" className="nav-item">  여행수정</NavLink> */}{" "}
        <NavLink to="/login" className="nav-item">
          Login{" "}
        </NavLink>{" "}
      </nav>{" "}
      <Routes>
        <Route path="/" element={<Home />}></Route>{" "}
        <Route path="/photos" element={<Photos />}></Route>{" "}
        <Route path="/tour" element={<Tour />}></Route>{" "}
        {/*아래는 링크 메뉴없이 parameter가 있는 url일 때 화면에 보임 */}
        <Route path="/editTrip/:docId" element={<EditTrip />} />{" "}
        <Route path="/login" element={<Login />}></Route>{" "}
      </Routes>{" "}
    </BrowserRouter>
  );
}
export default App;
