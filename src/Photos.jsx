// src/Photos.jsx
import React, { useState, useEffect } from "react";
import "./photos.css";
import app from "./firebaseConfig";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { Link, useNavigate } from "react-router";
import useLoginStore from "./useLoginStore";

// 한신대 로고 이미지 임포트 (경로 확인해주세요!)
import univLogo from "./assets/images.png";

const Photos = () => {
  const db = getFirestore(app);
  const storage = getStorage(app);
  const navigate = useNavigate();

  const isLogined = useLoginStore((state) => state.isLogined);
  const userName = useLoginStore((state) => state.userName);

  const [displayList, setDisplayList] = useState([]);
  const [trashList, setTrashList] = useState([]);
  const [docId, setDocId] = useState([]);
  const [trashDocId, setTrashDocId] = useState([]);

  const [refreshNeeded, setRefreshNeeded] = useState(0);
  const [showTrash, setShowTrash] = useState(false);
  const [viewMode, setViewMode] = useState("gallery");

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [commentInput, setCommentInput] = useState("");

  // 1. 검색어 상태 및 플로팅 메뉴 상태 추가
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnivLinks, setShowUnivLinks] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const querySnapshot = await getDocs(collection(db, "tourMemo"));
      const active = [];
      const activeIds = [];
      const trash = [];
      const trashIds = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // 데이터에 id 포함시키기 (필터링 후에도 ID를 찾기 위해)
        const itemWithId = { ...data, id: doc.id };

        if (data.isDeleted) {
          trash.push(itemWithId);
          trashIds.push(doc.id);
        } else {
          active.push(itemWithId);
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

  const moveToTrash = async (id) => {
    if (!window.confirm("휴지통으로 이동하시겠습니까?")) return;
    try {
      await updateDoc(doc(db, "tourMemo", id), { isDeleted: true });
      setRefreshNeeded((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const restoreHandle = async (id) => {
    if (!window.confirm("복구하시겠습니까?")) return;
    try {
      await updateDoc(doc(db, "tourMemo", id), { isDeleted: false });
      setRefreshNeeded((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const permanentDeleteHandle = async (id, photoURL) => {
    if (!window.confirm("정말 영구 삭제하시겠습니까?")) return;
    try {
      const photoImageRef = ref(storage, photoURL);
      await deleteObject(photoImageRef);
      await deleteDoc(doc(db, "tourMemo", id));
      setRefreshNeeded((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;
    if (!isLogined) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    const newComment = {
      text: commentInput,
      author: userName,
      createdAt: new Date().toLocaleDateString(),
    };
    try {
      const docRef = doc(db, "tourMemo", selectedId);
      await updateDoc(docRef, { comments: arrayUnion(newComment) });
      setSelectedItem((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setCommentInput("");
      setRefreshNeeded((prev) => prev + 1);
    } catch (error) {
      console.error("댓글 저장 실패:", error);
      alert("오류가 발생했습니다.");
    }
  };

  const openModal = (item, id) => {
    setSelectedItem(item);
    setSelectedId(id);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setSelectedId(null);
    setCommentInput("");
  };

  // 2. 현재 리스트 가져오기 및 검색 필터 적용
  const rawList = showTrash ? trashList : displayList;

  // 검색 기능: 여행지(location) 또는 한줄평(comment)에 검색어가 포함된 항목만 필터링
  const filteredList = rawList.filter(
    (item) =>
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="photos-container">
      <div className="photos-header">
        <h1>{showTrash ? "🗑️ 휴지통" : "📸 추억 저장소"}</h1>

        {/* 3. 검색 입력창 추가 */}
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="여행지나 내용으로 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="header-controls">
          <div className="view-toggle-wrapper">
            <label className="switch">
              <input
                type="checkbox"
                checked={viewMode === "list"}
                onChange={() =>
                  setViewMode(viewMode === "gallery" ? "list" : "gallery")
                }
              />
              <span className="slider round"></span>
            </label>
            <span className="toggle-label">
              {viewMode === "gallery" ? "갤러리 뷰" : "리스트 뷰"}
            </span>
          </div>

          {isLogined && (
            <button
              className="toggle-trash-btn"
              onClick={() => setShowTrash(!showTrash)}
            >
              {showTrash ? "📂 앨범으로" : "🗑️ 휴지통"}
            </button>
          )}
        </div>
      </div>

      {viewMode === "gallery" ? (
        <section className="cards">
          {/* 필터링된 리스트(filteredList) 사용 */}
          {filteredList.map((item) => (
            <div className="card" key={item.id}>
              <div className="img-wrapper">
                <img
                  className="cardImage"
                  src={item.photoURL}
                  alt="추억"
                  onClick={() => openModal(item, item.id)}
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
                    <>
                      <button
                        type="button"
                        className="restoreButton"
                        onClick={() => restoreHandle(item.id)}
                      >
                        복구
                      </button>
                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() =>
                          permanentDeleteHandle(item.id, item.photoURL)
                        }
                      >
                        영구 삭제
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to={"/editTrip/" + item.id} className="editButton">
                        <button>수정</button>
                      </Link>
                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() => moveToTrash(item.id)}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      ) : (
        <section className="list-view">
          <table className="list-table">
            <thead>
              <tr>
                <th width="8%">No.</th>
                <th width="50%">여행지 (제목)</th>
                <th width="20%">날짜</th>
                <th width="22%">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td
                    className="list-title"
                    onClick={() => openModal(item, item.id)}
                  >
                    <div className="title-wrapper">
                      <span className="main-title">{item.location}</span>
                      <span className="sub-comment">{item.comment}</span>
                    </div>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    {isLogined && (
                      <div className="list-buttons">
                        {showTrash ? (
                          <>
                            <button
                              className="small-btn restore"
                              onClick={() => restoreHandle(item.id)}
                            >
                              복구
                            </button>
                            <button
                              className="small-btn delete"
                              onClick={() =>
                                permanentDeleteHandle(item.id, item.photoURL)
                              }
                            >
                              삭제
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={"/editTrip/" + item.id}
                              className="small-btn edit"
                            >
                              수정
                            </Link>
                            <button
                              className="small-btn delete"
                              onClick={() => moveToTrash(item.id)}
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {filteredList.length === 0 && (
        <div className="no-result-msg">검색 결과가 없습니다.</div>
      )}

      {/* 모달 관련 코드는 기존과 동일 */}
      {selectedItem && (
        <div className="insta-modal-overlay" onClick={closeModal}>
          <div
            className="insta-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ... 기존 모달 내용 (이미지, 정보 등) ... */}
            <div className="insta-img-section">
              <img src={selectedItem.photoURL} alt="Detail View" />
            </div>
            <div className="insta-info-section">
              <div className="insta-header">
                <div className="user-avatar-placeholder">👤</div>
                <div className="insta-user-info">
                  <span className="username">
                    {selectedItem.author || "Traveler"}
                  </span>
                  <span className="location">{selectedItem.location}</span>
                </div>
                <button className="close-btn-text" onClick={closeModal}>
                  ✕
                </button>
              </div>
              <div className="insta-body">
                <div className="comment-row">
                  <span className="username-bold">
                    {selectedItem.author || "Traveler"}
                  </span>
                  <span className="comment-text">{selectedItem.comment}</span>
                </div>
                {selectedItem.comments && selectedItem.comments.length > 0 ? (
                  selectedItem.comments.map((cmt, idx) => (
                    <div className="comment-row" key={idx}>
                      <span className="username-bold">{cmt.author}</span>
                      <span className="comment-text">{cmt.text}</span>
                      <span className="comment-date-small">
                        {cmt.createdAt}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-comments">첫 댓글을 남겨보세요! 👇</div>
                )}
              </div>
              <div className="insta-footer">
                <div className="action-icons">
                  <span>❤️</span> <span>💬</span> <span>✈️</span>
                </div>
                <div className="post-date">{selectedItem.date}</div>
                {isLogined && (
                  <div className="comment-input-area">
                    <input
                      type="text"
                      placeholder="댓글 달기..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    />
                    <button
                      className="post-comment-btn"
                      onClick={handleAddComment}
                      disabled={!commentInput.trim()}
                    >
                      게시
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 플로팅 액션 버튼 (FAB) - 우측 하단 고정 */}
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
    </div>
  );
};
export default Photos;
