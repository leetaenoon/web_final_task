// src/Login.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import app from "./firebaseConfig";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import useLoginStore from "./useLoginStore";
import "./Login.css"; // 1. 스타일 파일 임포트

const Login = () => {
  const { isLogined, logined, logouted } = useLoginStore();

  let [nickName, setNickName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");

  let pwRef = useRef();
  const navigate = useNavigate();
  const auth = getAuth(app);

  const nickNameChangeHandle = (e) => setNickName(e.target.value);
  const emailChangeHandle = (e) => setEmail(e.target.value);
  const passwordChangeHandle = (e) => setPassword(e.target.value);

  const signUpHandle = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("비밀번호의 길이는 6자리 이상이어야 합니다.");
      pwRef.current.focus();
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        updateProfile(user, { displayName: nickName });
        alert("회원가입이 완료되었습니다.");
        setNickName("");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        console.log(error);
        alert("회원가입 실패: " + error.message);
      });
  };

  const signInHandle = (e) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        logined(user.displayName);
        alert("환영합니다! 로그인되었습니다.");
        setEmail("");
        setPassword("");
        navigate("/");
      })
      .catch((error) => {
        console.log("에러 발생 :", error);
        alert("로그인 실패: 아이디와 비밀번호를 확인해주세요.");
      });
  };

  const logOutHandle = () => {
    signOut(auth)
      .then(() => {
        logouted();
        alert("로그아웃이 완료되었습니다.");
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 로그인 및 회원가입</h1>
          <p>이메일과 비밀번호로 간편하게 시작하세요.</p>
        </div>

        <form className="login-form">
          <div className="form-group">
            <label htmlFor="nickName">닉네임</label>
            <input
              type="text"
              id="nickName"
              value={nickName}
              onChange={nickNameChangeHandle}
              placeholder="홍길동 (회원가입 시 필수)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={emailChangeHandle}
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              ref={pwRef}
              value={password}
              onChange={passwordChangeHandle}
              placeholder="6자리 이상 입력"
            />
          </div>

          <div className="login-button-group">
            {isLogined ? (
              <button
                type="button"
                className="logout-full-btn"
                onClick={logOutHandle}
              >
                로그아웃
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="login-btn"
                  onClick={signInHandle}
                >
                  로그인
                </button>
                <button
                  type="button"
                  className="signup-btn"
                  onClick={signUpHandle}
                >
                  회원가입
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Login;
