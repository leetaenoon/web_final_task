// src/Photos.jsx
import React, { useState, useEffect } from "react";
import "./photos.css";
import app from "./firebaseConfig";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc, // 업데이트 함수 추가
  doc,
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Link, useNavigate } from "react-router";
import useLoginStore from "./useLoginStore";

const Photos = () => {
  const db = getFirestore(app);
  const storage = getStorage(app);
  const navigate = useNavigate();
  const isLogined = useLoginStore((state) => state.isLogined);

  // 1. 상태 변수 분리 (앨범용 / 휴지통용)
  const [displayList, setDisplayList] = useState([]); // 앨범 목록
  const [trashList, setTrashList] = useState([]); // 휴지통 목록
  const [docId, setDocId] = useState([]); // 앨범 ID들
  const [trashDocId, setTrashDocId] = useState([]); // 휴지통 ID들

  const [refreshNeeded, setRefreshNeeded] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  // 2. 현재 휴지통을 보고 있는지 여부
  const [showTrash, setShowTrash] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const querySnapshot = await getDocs(collection(db, "tourMemo"));

      const active = [];
      const activeIds = [];
      const trash = [];
      const trashIds = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // isDeleted가 true면 휴지통으로, 아니면 앨범으로 분류
        if (data.isDeleted) {
          trash.push(data);
          trashIds.push(doc.id);
        } else {
          active.push(data);
          activeIds.push(doc.id);
        }
      });

      setDisplayList(active);
      setDocId(activeIds);
      setTrashList(trash);
      setTrashDocId(trashIds);
    };
    getData();
  }, [refreshNeeded]);

  // 3. 휴지통으로 이동 (Soft Delete)
  const moveToTrash = async (id) => {
    if (!window.confirm("휴지통으로 이동하시겠습니까?")) return;
    try {
      // 문서를 삭제하지 않고 'isDeleted' 필드만 true로 변경
      await updateDoc(doc(db, "tourMemo", id), { isDeleted: true });
      setRefreshNeeded((prev) => prev + 1);
      alert("휴지통으로 이동되었습니다.");
    } catch (error) {
      console.log("이동 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // 4. 휴지통에서 복구 (Restore)
  const restoreHandle = async (id) => {
    if (!window.confirm("복구하시겠습니까?")) return;
    try {
      // 'isDeleted' 필드를 false로 변경하여 앨범으로 복귀
      await updateDoc(doc(db, "tourMemo", id), { isDeleted: false });
      setRefreshNeeded((prev) => prev + 1);
      alert("복구되었습니다.");
    } catch (error) {
      console.log("복구 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // 5. 영구 삭제 (Permanent Delete)
  const permanentDeleteHandle = async (id, photoURL) => {
    if (!window.confirm("정말 영구 삭제하시겠습니까? 복구할 수 없습니다."))
      return;

    try {
      // 스토리지 이미지 삭제
      const photoImageRef = ref(storage, photoURL);
      await deleteObject(photoImageRef);
      // DB 문서 진짜 삭제
      await deleteDoc(doc(db, "tourMemo", id));

      setRefreshNeeded((prev) => prev + 1);
      alert("영구 삭제되었습니다.");
    } catch (error) {
      console.log("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // 현재 뷰(앨범 vs 휴지통)에 따라 보여줄 리스트 결정
  const currentList = showTrash ? trashList : displayList;
  const currentIds = showTrash ? trashDocId : docId;

  return (
    <div className="photos-container">
      <div className="photos-header">
        <h1>{showTrash ? "🗑️ 휴지통" : "📸 추억 저장소"}</h1>
        <p>
          {showTrash
            ? "삭제된 사진을 복구하거나 영구 삭제할 수 있습니다."
            : "여러분의 소중한 여행 기록을 확인해보세요."}
        </p>

        {/* 휴지통 전환 버튼 (로그인 시에만) */}
        {isLogined && (
          <button
            className="toggle-trash-btn"
            onClick={() => setShowTrash(!showTrash)}
          >
            {showTrash ? "📂 앨범으로 돌아가기" : "🗑️ 휴지통 보기"}
          </button>
        )}
      </div>

      <section className="cards">
        {currentList.map((item, index) => {
          return (
            <div className="card" key={index}>
              <div className="img-wrapper">
                <img
                  className="cardImage"
                  src={item.photoURL}
                  alt="추억의 사진"
                  onClick={() => setSelectedImage(item.photoURL)}
                />
              </div>

              <div className="cardContent">
                <span className="cardDate">{item.date}</span>
                <h2 className="cardTitle">{item.location}</h2>
                <p className="cardText">{item.comment}</p>
              </div>

              {isLogined && (
                <div className="buttons">
                  {showTrash ? (
                    /* 휴지통 모드일 때 버튼 */
                    <>
                      <button
                        type="button"
                        className="restoreButton"
                        onClick={() => restoreHandle(currentIds[index])}
                      >
                        복구
                      </button>
                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() =>
                          permanentDeleteHandle(
                            currentIds[index],
                            item.photoURL
                          )
                        }
                      >
                        영구 삭제
                      </button>
                    </>
                  ) : (
                    /* 앨범 모드일 때 버튼 */
                    <>
                      <Link
                        to={"/editTrip/" + currentIds[index]}
                        className="editButton"
                      >
                        <button type="button">수정</button>
                      </Link>
                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() => moveToTrash(currentIds[index])}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {currentList.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "50px", color: "#888" }}>
          <p>
            {showTrash
              ? "휴지통이 비었습니다."
              : "아직 등록된 추억이 없습니다. 여행을 등록해보세요!"}
          </p>
        </div>
      )}

      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Original View" />
            <button className="close-modal-btn" onClick={closeModal}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Photos;
