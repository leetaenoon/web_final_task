// src/Home.jsx
import React, { useState, useEffect } from "react";
import useLoginStore from "./useLoginStore";
import "./Home.css";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc, // 1. updateDoc 추가
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import app from "./firebaseConfig";

const Home = () => {
  const isLogined = useLoginStore((state) => state.isLogined);
  const userName = useLoginStore((state) => state.userName);

  const db = getFirestore(app);

  const [updates, setUpdates] = useState([]);
  const [newItem, setNewItem] = useState("");

  // 2. 수정 모드를 위한 상태 변수 추가
  const [editingId, setEditingId] = useState(null); // 현재 수정 중인 항목의 ID
  const [editText, setEditText] = useState(""); // 수정 중인 텍스트 내용

  // 데이터 불러오기 (Read)
  useEffect(() => {
    const getData = async () => {
      try {
        const q = query(collection(db, "siteUpdates"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const loadedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUpdates(loadedData);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };
    getData();
  }, [db]);

  // 데이터 추가하기 (Create)
  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      const docRef = await addDoc(collection(db, "siteUpdates"), {
        text: newItem,
        date: new Date().toISOString(),
        author: userName,
      });
      setUpdates((prev) => [
        {
          id: docRef.id,
          text: newItem,
          date: new Date().toISOString(),
          author: userName,
        },
        ...prev,
      ]);
      setNewItem("");
    } catch (error) {
      console.error("추가 실패:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  // 데이터 삭제하기 (Delete)
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "siteUpdates", id));
      setUpdates((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  // 3. 수정 버튼 클릭 시 실행 (수정 모드 진입)
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  // 4. 수정 취소
  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  // 5. 수정 사항 저장하기 (Update)
  const saveUpdate = async (id) => {
    if (!editText.trim()) return; // 빈 값 방지

    try {
      // Firestore 문서 업데이트
      await updateDoc(doc(db, "siteUpdates", id), {
        text: editText,
      });

      // 로컬 상태 업데이트 (화면 갱신)
      setUpdates((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, text: editText } : item
        )
      );

      // 수정 모드 종료
      cancelEditing();
    } catch (error) {
      console.error("수정 실패:", error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="home-container">
      {isLogined ? (
        <h2 className="welcome-msg">
          환영합니다 {userName}님 오늘은 어떠신가요?
        </h2>
      ) : (
        <h2 className="login-request-msg">로그인을 해주세요</h2>
      )}

      <h1>코딩하면서 업그레이드 내역을 밑에 적어보세요!</h1>

      <div className="changelog-section">
        <h3>🛠️ 사이트 업데이트 내역</h3>

        {isLogined && (
          <div className="input-group">
            <input
              type="text"
              placeholder="오늘 무엇을 수정했나요?"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button onClick={handleAdd}>업로드</button>
          </div>
        )}

        <ul className="update-list">
          {updates.map((item) => (
            <li key={item.id} className="update-item">
              {/* 6. 수정 모드인지 확인하여 다른 UI 렌더링 */}
              {editingId === item.id ? (
                // [수정 모드일 때]
                <div className="edit-mode-group">
                  <input
                    type="text"
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveUpdate(item.id)}
                  />
                  <div className="edit-buttons">
                    <button
                      onClick={() => saveUpdate(item.id)}
                      className="save-btn"
                    >
                      저장
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // [일반 모드일 때]
                <>
                  <span className="update-text">{item.text}</span>
                  <div className="item-meta">
                    <span className="update-date">
                      {new Date(item.date).toLocaleDateString()}
                    </span>

                    {/* 로그인 상태일 때만 수정/삭제 버튼 노출 */}
                    {isLogined && (
                      <div className="action-buttons">
                        <button
                          className="edit-mini-btn"
                          onClick={() => startEditing(item)}
                        >
                          수정
                        </button>
                        <button
                          className="delete-mini-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
          {updates.length === 0 && (
            <p className="no-data">아직 등록된 내역이 없습니다.</p>
          )}
        </ul>
      </div>

      <p className="home-description">
        다른 목록도 넘겨보세요! <br />
        {/* <span className="highlight-text">
          [이 부분은 여러분들이 원하는 내용으로 다시 작성해야 합니다.]
        </span> */}
      </p>
    </div>
  );
};

export default Home;
