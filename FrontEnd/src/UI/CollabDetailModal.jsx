import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "../util/fetchWithAuth";

// 1. 부모로부터 scrapType prop을 받도록 추가합니다.
const CollabDetailModal = ({ isOpen, onClose, keywordName, scrapType }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // scrapType이 유효할 때만 데이터를 로드합니다.
    if (isOpen && keywordName && scrapType) {
      loadScrapDetails();
    }
  }, [isOpen, keywordName, scrapType]); // 의존성 배열에 scrapType 추가

  const loadScrapDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 [${scrapType}] 상세 정보 로드 시작:`, keywordName);

      // 2. API 주소를 새 통합 주소로 변경하고, type 파라미터를 추가합니다.
      const response = await fetchWithAuth(
        `/zal/api/mypage/scrap-details?keyword=${encodeURIComponent(keywordName)}&type=${encodeURIComponent(scrapType)}`,
        {
          method: "GET"
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDetails(result.data);
          console.log("✅ 상세 정보 로드 성공:", result.data);
        } else {
          setError(result.message);
          console.error("❌ 상세 정보 로드 실패:", result.message);
        }
      } else {
        setError("서버 오류가 발생했습니다.");
        console.error("❌ 상세 정보 API 호출 실패");
      }
    } catch (error) {
      console.error("❌ 상세 정보 로드 오류:", error);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          {/* 3. 모달 제목이 scrapType에 따라 동적으로 변경됩니다. */}
          <h2 className="text-xl font-bold text-gray-800 flex-1 pr-4 truncate">
            [{scrapType}] {keywordName}에 관한 상세 정보
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            style={{ minWidth: '32px', minHeight: '32px' }}
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : details.length > 0 ? (
            <div className="space-y-6">
              {details.map((detail, index) => (
                <div key={detail.ideaId || index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {index + 1}. {detail.contentTitle || detail.title}
                  </h3>
                  <div className="space-y-3">
                    {detail.contentDesc1 && (
                      <div className="bg-blue-50 p-3 rounded">
                        <span className="font-medium text-blue-800">아이디어 1:</span>
                        <p className="text-gray-700 mt-1">{detail.contentDesc1}</p>
                      </div>
                    )}
                    {detail.contentDesc2 && (
                      <div className="bg-green-50 p-3 rounded">
                        <span className="font-medium text-green-800">아이디어 2:</span>
                        <p className="text-gray-700 mt-1">{detail.contentDesc2}</p>
                      </div>
                    )}
                    {detail.contentDesc3 && (
                      <div className="bg-purple-50 p-3 rounded">
                        <span className="font-medium text-purple-800">아이디어 3:</span>
                        <p className="text-gray-700 mt-1">{detail.contentDesc3}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              해당 키워드의 스크랩 아이디어가 없습니다.
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollabDetailModal;
