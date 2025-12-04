// src/Tour.jsx
import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import app from "./firebaseConfig";
import "./Tour.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import useLoginStore from "./useLoginStore";

const Tour = () => {
  const db = getFirestore(app);
  const storage = getStorage(app);

  const isLogined = useLoginStore((state) => state.isLogined);
  // 1. 로그인한 사용자 이름 가져오기
  const userName = useLoginStore((state) => state.userName);

  let [location1, setLocation1] = useState("");
  let [date1, setDate1] = useState("");
  let [comment, setComment] = useState("");
  let [image, setImage] = useState(null);

  const locHandle = (e) => setLocation1(e.target.value);
  const dateHandle = (e) => setDate1(e.target.value);
  const commentHandle = (e) => setComment(e.target.value);

  const handleReset = () => {
    setLocation1("");
    setDate1("");
    setComment("");
    setImage(null);
  };

  const storeHandle = async (e) => {
    e.preventDefault();
    if (!isLogined) {
      alert("로그인을 해야 업로드가 가능합니다.");
      return;
    }
    if (image == null) {
      alert("사진을 반드시 선택해야 합니다.");
      return;
    }

    const storageRef = ref(storage, "images/" + image.name);
    let photoURL = null;

    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          photoURL = downloadURL;
          addDoc(collection(db, "tourMemo"), {
            location: location1,
            date: date1,
            comment,
            photoURL,
            isDeleted: false,
            comments: [],
            // 2. 작성자 이름 저장 (없으면 '익명' 처리)
            author: userName || "익명",
          });
          handleReset();
          alert("한 건의 여행 추억을 등록하였습니다.");
        });
      }
    );
  };

  return (
    // ... (기존 JSX와 동일)
    <div className="tour-page-container">
      {/* ... 생략 ... */}
      <div className="tour-header">
        <h1>✈️ 나의 여행 기록하기</h1>
        <p>
          잊지 못할 추억을 사진과 함께 남겨보세요. <br />
          {!isLogined && (
            <span className="warning-text">(로그인이 필요한 기능입니다)</span>
          )}
        </p>
      </div>

      <form className="tour-form-card">
        <div className="form-group">
          <label htmlFor="location">여행지</label>
          <input
            type="text"
            id="location"
            placeholder="예: 제주도, 파리, 우리집 앞마당"
            onChange={locHandle}
            value={location1}
            disabled={!isLogined}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">날짜</label>
          <input
            type="date"
            id="date"
            onChange={dateHandle}
            value={date1}
            disabled={!isLogined}
          />
        </div>

        <div className="form-group">
          <label htmlFor="comment">한 줄 평</label>
          <textarea
            id="comment"
            rows="4"
            placeholder="여행에서의 기분이나 기억에 남는 일을 적어주세요."
            onChange={commentHandle}
            value={comment}
            disabled={!isLogined}
          />
        </div>

        <div className="form-group">
          <label htmlFor="file">사진 첨부</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="file"
              className="file-input-hidden"
              onChange={(e) => setImage(e.target.files[0])}
              disabled={!isLogined}
            />
          </div>
        </div>

        <div className="form-buttons">
          <button
            type="submit"
            onClick={storeHandle}
            className="submit-btn"
            disabled={!isLogined}
          >
            저장하기
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="reset-btn"
            disabled={!isLogined}
          >
            초기화
          </button>
        </div>
      </form>
    </div>
  );
};

export default Tour;
