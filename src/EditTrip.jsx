//EditTrip.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import "./photos.css";
import app from "./firebaseConfig";
//import { getStorage, ref } from "firebase/storage";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import useLoginStore from "./useLoginStore"; //zustand 상태관리 라이브러리 사용
function EditTrip() {
  const db = getFirestore(app); //파이어스토어 데이터베이스 연결
  const storage = getStorage(app); //이미지 저장을 위한 스토리지 연결 //   let isLogined = useRecoilValue(loginAtom);
  const isLogined = useLoginStore((state) => state.isLogined);
  const navigate = useNavigate();
  const { docId } = useParams(); //데이터베이스의 필드들
  let [location1, setLocation1] = useState("");
  let [date1, setDate1] = useState("");
  let [comment, setComment] = useState("");
  let [photoURL, setPhotoURL] = useState("");
  let [image, setImage] = useState(null); //업로드할 파일 객체
  useEffect(() => {
    const getData = async () => {
      //아래는 하나의 문서를 읽어들이는 구문
      const querySnapshot = await getDoc(doc(db, "tourMemo", docId)); //콜렉션명:tourMemo
      const ob = querySnapshot.data(); //js 객체로… //   setEditValue(ob);  //수정할 객체의 원본 데이터
      setLocation1(ob.location);
      setComment(ob.comment);
      setDate1(ob.date);
      setPhotoURL(ob.photoURL);
    };
    getData();
  }, [db, docId]);
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
          photoURL = downloadURL; //storage에 저장된 포토 url 주소임 //console.log("File available at", downloadURL); //문서(document)를 update하기(덮어쓰기 함수)
          setDoc(doc(db, "tourMemo", docId), {
            location: location1,
            date: date1,
            comment,
            photoURL,
          });
          setLocation1("");
          setDate1("");
          setComment("");
          setImage(null);
          alert("추억 여행을 수정했습니다.");
          navigate("/photos"); //포토 모음 전체 보기
        });
      }
    );
  };
  return (
    <>
      {" "}
      <h1 style={{ marginInline: "2rem" }}>
        [링크 메뉴는 없음]추억 여행의 기록을 수정합니다.{" "}
      </h1>{" "}
      <h3 style={{ color: "red", marginInline: "2rem" }}>
        주)Image 수정을 반드시해야 수정이 정상적으로 완료됩니다.{" "}
      </h3>{" "}
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
          <img src={photoURL} alt="읽은 사진" width="300"></img>
          <div style={{ marginTop: "0.7em" }}>새 사진 선택(필수) </div>{" "}
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
              수정한 데이터 저장하기{" "}
            </button>
            &nbsp; <input type="reset" value="초기화" onClick={handleReset} />{" "}
          </div>{" "}
        </div>{" "}
      </form>{" "}
    </>
  );
}
export default EditTrip;
