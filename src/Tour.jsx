//Tours.jsx
import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import app from "./firebaseConfig";
import "./App.css";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import useLoginStore from "./useLoginStore";
const Tour = () => {
  //Tour 컴포넌트
  const db = getFirestore(app); //파이어스토어 데이터베이스 연결
  const storage = getStorage(app); //이미지 저장을 위한 스토리지 연결

  const isLogined = useLoginStore((state) => state.isLogined); //console.log("db : ", db);
  let [location1, setLocation1] = useState("");
  let [date1, setDate1] = useState("");
  let [comment, setComment] = useState("");
  let [image, setImage] = useState(null); //업로드할 파일 객체
  const locHandle = (e) => {
    //여행지 위치 등록 정보
    //e.preventDefault();
    setLocation1(e.target.value);
  };
  const dateHandle = (e) => {
    //e.preventDefault();
    setDate1(e.target.value);
  };
  const commentHandle = (e) => {
    //e.preventDefault();
    setComment(e.target.value);
  };
  const handleReset = () => {
    //초기화
    setLocation1("");
    setDate1("");
    setComment("");
    setImage(null);
  }; //이미지를 포함한 데이터 저장
  const storeHandle = async (e) => {
    e.preventDefault();
    if (!isLogined) {
      alert("로그인을 해야 업로드가 가능합니다.");
      return;
    }
    if (image == null) return; //아래는 스토리지 버킷의 images 폴더 아래 기존 파일명으로 저장할 것이라는 의미
    const storageRef = ref(storage, "images/" + image.name); //저장될 폴더및파일명 // uploadBytes(storageRef, image).then((snapshot) => { //   console.log("Uploaded a blob or file!"); // });
    let photoURL = null; //아래의 경우에는  메타데이터가 없음
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded
        // and the total number of bytes to be uploaded(생략하였음)
      },
      (error) => {
        // A full list of error codes is available at
        console.log(error);
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        //업로드 성공시 url 주소를 얻고, firestore에 기존 정보와 함께 저장하도록 함.
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          photoURL = downloadURL; //storage에 저장된 포토 url 주소임 //console.log("File available at", downloadURL);
          addDoc(collection(db, "tourMemo"), {
            location: location1,
            date: date1,
            comment,
            photoURL,
          });
          setLocation1("");
          setDate1("");
          setComment("");
          setImage(null);
          alert("한 건의 여행 추억을 등록하였습니다.");
        });
      }
    );
  };
  return (
    <div>
      {" "}
      <h1 style={{ textAlign: "center", marginTop: "100px", color: "brown" }}>
        나의 여행 등록하기{" "}
        <span style={{ fontSize: "16px" }}>(로그인상태에서만 가능함)</span>{" "}
      </h1>{" "}
      <form>
        {" "}
        <div className="tourContainer">
          <div>여 행 지</div>{" "}
          <input
            type="text"
            id="여행지"
            onChange={locHandle}
            value={location1}
            style={{ lineHeight: "1.6em" }}
          />
          <div style={{ marginTop: "0.7em" }}>날 짜 </div>{" "}
          <input type="date" id="date" onChange={dateHandle} value={date1} />
          <div style={{ marginTop: "0.7em" }}>한 줄 평</div>{" "}
          <textarea
            cols="40"
            id="평가"
            onChange={commentHandle}
            value={comment}
          />
          <div style={{ marginTop: "0.7em" }}>사 진 첨 부 </div>{" "}
          <input
            type="file"
            id="file"
            onChange={(e) => {
              setImage(e.target.files[0]);
            }}
          />{" "}
          <div
            style={{
              display: "inline-block",
              marginTop: "0.7em",
              fontSize: "24px",
            }}
          >
            {" "}
            <button
              type="submit"
              onClick={storeHandle}
              style={{
                color: "white",
                backgroundColor: "blue",
              }}
            >
              저장소에 저장하기{" "}
            </button>
            &nbsp; <input type="reset" value="초기화" onClick={handleReset} />{" "}
          </div>{" "}
        </div>{" "}
      </form>{" "}
    </div>
  );
};
export default Tour;
