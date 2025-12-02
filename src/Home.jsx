// src/Home.jsx
import React from "react";
import useLoginStore from "./useLoginStore";
import "./Home.css";

const Home = () => {
  const isLogined = useLoginStore((state) => state.isLogined);
  const userName = useLoginStore((state) => state.userName);

  return (
    <>
      {isLogined ? (
        <h2 className="welcome-msg">
          환영합니다 {userName}님 오늘은 어떠신가요?
        </h2>
      ) : (
        <h2 className="login-request-msg">로그인을 해주세요</h2>
      )}

      <h1>당신은 지금 어떤걸 수정하고 계신가요?</h1>
      <h1>수정사항을 이 밑에 적으면서 사이트를 업그레이드 하세요!</h1>

      <p className="home-description">
        {/* 내용 생략 (기존과 동일) */}
        Lorem Ipsum is simply dummy text...
      </p>
    </>
  );
};
export default Home;
