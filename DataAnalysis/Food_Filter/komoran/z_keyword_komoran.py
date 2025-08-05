# 설치 안내:
#  pip install kiwipiepy konlpy pandas transformers
# Komoran 및 KiwiPiey, zero-shot 분류를 위한 transformers를 사용합니다.

import os
import glob
import re
import pandas as pd
from konlpy.tag import Komoran
from kiwipiepy import Kiwi
from transformers import pipeline

# 1. 사용자 정의 음식 키워드 함수 (먼저 정의) ----------------------------------
def get_predefined_food_keywords():
    """
    미리 정의된 음식 관련 키워드들을 반환합니다.
    트렌드 음식, 브랜드명, 복합어 등 AI가 놓칠 수 있는 키워드들을 포함합니다.
    """
    predefined_keywords = {
        # 트렌드 음식/디저트
        "수건케이크", "수건케익", "마오쥔젤", "마오진젤", "크로플", "달고나크로플", "마라탕", "마라샹궈", "탕후루",
        "달고나커피", "달고나", "허니브레드", "크림치즈케이크", "티라미수케이크",
        "바스크치즈케이크", "크루아상", "마카롱", "에클레어", "슈크림",
        "머랭쿠키", "대왕쿠키", "풋롱쿠키", "메론빵", "타코야끼", "츄러스",
        "오므라이스", "크레페", "야끼소바", "포켓몬빵", "킨조젤리", "훠궈", "샤인머스캣",
        "망고", "딸기", "바나나", "사과", "멜론", "수박", "파삭",

        # 브랜드/매장명 (음식 관련)
        "성심당케익부띠끄", "성심당케익부티크", "성심당", "성심당무화과", "성심당시루케이크",
        "뚜레쥬르", "파리바게뜨", "던킨도너츠", "크리스피크림", "베스킨라빈스",
        "하겐다즈", "벤앤제리스", "맥도날드", "버거킹", "롯데리아", "맘스터치",
        "서브웨이", "도미노피자", "피자헛", "파파존스", "교촌치킨", "네네치킨",
        "굽네치킨", "처갓집양념치킨", "엽기떡볶이", "두바이초콜릿", "엽기떡볶이", "소금빵", "초콜릿",
        "요아정", "라라스윗", "메가커피", "설빙", "칼디", "돈키호테"

        # 한국 전통/지역 음식
        "떡볶이", "떡볶이밀키트", "대왕컵떡볶이", "순대", "어묵", "붕어빵", "호떡",
        "계란빵", "군고구마", "군밤", "뻥튀기", "약과", "한과", "식혜", "수정과",
        "매실차", "유자차", "대추차", "생강차", "둥굴레차", "보리차", "두찜",
        "불닭", "불닭볶음면", "중국식빵", "마시멜로", "까르보불닭", "고추바사삭",

        # 복합어/신조어
        "치킨버거", "새우버거", "불고기버거", "치즈버거", "베이컨버거",
        "아이스아메리카노", "카페라떼", "카푸치노", "마키아또", "프라푸치노",
        "스무디", "밀크셰이크", "버블티", "타피오카", "펄밀크티", "마늘빵", "빙산롱옌"

        # 디저트/베이커리
        "마들렌", "휘낭시에", "카스테라", "롤케이크", "치즈케이크", "초콜릿케이크",
        "딸기케이크", "생크림케이크", "버터쿠키", "초콜릿쿠키", "마카롱쿠키",
        "민트초코", "쫀득쿠키", "메론킥", "메로나",
        "크레페", "킨조젤지", "동결건조", "스위즐스", "성심당무화과 ",
        "asmr", "파삭", "크레페", "중국식빵", "바나나빵","바나나킥", "와라비모찌", "쿠키", "초코라떼", "초코젤라또녹차라떼",
        "카다이프", "브륄레", "컵빙", "팬케이크", "피스타치오", "하리보", "핫치즈빅싸이",
        "꼬치", "하이디라오", "핫뿌링클", "카다이프",

        # 아시아 음식
        "쌀국수", "팟타이", "똠양꿍", "그린커리", "레드커리", "스시", "사시미",
        "라멘", "우동", "소바", "돈카츠", "가츠동", "규동", "오야코동",
        "짜장면", "짬뽕", "탕수육", "깐풍기", "마파두부", "양꼬치", "이자카야",

        # 음료/주류
        "아메리카노", "에스프레소", "콜드브루", "디카페인", "녹차라떼", "홍차라떼",
        "얼그레이", "캐모마일", "페퍼민트", "루이보스", "히비스커스",
        "막걸리", "소주", "맥주", "와인", "샴페인", "위스키", "브랜디",

        # 미디어/콘텐츠 관련 (음식)
        "먹방", "먹스타그램", "레시피", "요리", "베이킹", "쿡방",

        
    }

    return predefined_keywords

# 2. 환경설정 ------------------------------------------------
script_dir = os.path.dirname(os.path.abspath(__file__))
result_dir = os.path.join(script_dir, 'resultDic')

# 결과 디렉토리 생성
os.makedirs(result_dir, exist_ok=True)

# Komoran 사용자 사전 경로
userdic_path = os.path.join(result_dir, 'komoran_userdic.txt')

# 3. 사용자 사전 먼저 구축 ----------------------------------------
def build_initial_userdic():
    """
    사용자 정의 키워드로 초기 사용자 사전을 구축합니다.
    """
    print("🔧 초기 사용자 사전 구축 중...")

    predefined_keywords = get_predefined_food_keywords()

    with open(userdic_path, 'w', encoding='utf-8') as wf:
        for word in sorted(predefined_keywords):
            # 한글만 포함된 키워드만 사전에 추가
            if word and len(word) >= 2 and all(ord('가') <= ord(c) <= ord('힣') for c in word):
                wf.write(f"{word}\tNNG\t9999\n")

    print(f"✅ 초기 사용자 사전 구축 완료: {len(predefined_keywords)}개 키워드")
    return predefined_keywords

# 사용자 사전 구축 실행
initial_keywords = build_initial_userdic()

# 4. 형태소 분석기 초기화 (사용자 사전 포함) ----------------------
komoran = Komoran(userdic=userdic_path)
kiwi = Kiwi()

# 5. Zero-Shot 분류기 초기화 (단어 단위 음식 관련 필터) --------
device = 0  # CPU 사용, GPU 있을 경우 0으로 설정
classifier = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    device=device,
    multi_label=False
)
candidate_labels = ["food", "non-food"]
threshold = 0.8

# 6. 데이터 파일 수집 -----------------------------------------
insta_dir = os.path.abspath(os.path.join(script_dir, '..', 'instar_post_filter'))
insta_pattern = os.path.join(insta_dir, '*_food_filter.csv')
insta_files = glob.glob(insta_pattern)

yt_dir = os.path.abspath(os.path.join(script_dir, '..', 'youtube_video_filter'))
yt_pattern = os.path.join(yt_dir, '*.csv')
yt_files = glob.glob(yt_pattern)

# 3. 텍스트 추출 함수 -----------------------------------------
def extract_text_from_insta(path):
    try:
        df = pd.read_csv(path, encoding='utf-8-sig')
        if 'HASHTAGS' in df.columns and not df['HASHTAGS'].isna().all():
            words = []
            for cell in df['HASHTAGS'].astype(str):
                if cell and cell != 'nan':
                    # 안전한 텍스트만 추가
                    tags = [tag.lstrip('#').strip() for tag in cell.split(',') if tag.strip()]
                    words.extend([tag for tag in tags if is_safe_text(tag)])
            return words
        texts = df['POST_TEXT'].astype(str).tolist()
        return [text for text in texts if is_safe_text(text)]
    except Exception as e:
        print(f"❌ 파일 읽기 오류: {path} - {e}")
        return []

def is_safe_text(text):
    """안전한 텍스트인지 확인 (인코딩 오류 방지)"""
    try:
        if not text or text == 'nan' or len(text.strip()) == 0:
            return False
        # UTF-8 인코딩 테스트
        text.encode('utf-8').decode('utf-8')
        return True
    except (UnicodeDecodeError, UnicodeEncodeError, AttributeError):
        return False


def extract_text_from_yt(path):
    df = pd.read_csv(path, encoding='utf-8-sig')
    return df['TITLE'].astype(str).tolist()

# 7. 키워드 매칭 함수 ----------------------------------

def check_predefined_keywords(text):
    """
    텍스트에서 미리 정의된 음식 키워드를 찾아 반환합니다.
    """
    predefined = get_predefined_food_keywords()
    found_keywords = set()

    # 정확한 매칭
    for keyword in predefined:
        if keyword in text:
            found_keywords.add(keyword)

    # 부분 매칭 (브랜드명 등)
    for keyword in predefined:
        # 성심당 관련 키워드들
        if "성심당" in keyword and "성심당" in text:
            found_keywords.add(keyword)
        # 케이크/케익 관련
        elif ("케이크" in keyword or "케익" in keyword) and ("케이크" in text or "케익" in text):
            if any(part in text for part in keyword.replace("케이크", "").replace("케익", "").split()):
                found_keywords.add(keyword)
        # 쿠키 관련
        elif "쿠키" in keyword and "쿠키" in text:
            found_keywords.add(keyword)

        # 김치 브랜드 관련
        elif "김치" in keyword and "김치" in text:
            found_keywords.add(keyword)
        # 치킨 브랜드 관련
        elif "치킨" in keyword and "치킨" in text:
            found_keywords.add(keyword)
        # 피자 브랜드 관련
        elif "피자" in keyword and "피자" in text:
            found_keywords.add(keyword)
        # 카페/커피 브랜드 관련
        elif ("스타벅스" in keyword or "카페" in keyword) and ("스타벅스" in text or "카페" in text):
            found_keywords.add(keyword)
        # 베이커리 브랜드 관련
        elif ("파리바게뜨" in keyword or "뚜레쥬르" in keyword) and ("파리바게뜨" in text or "뚜레쥬르" in text):
            found_keywords.add(keyword)
        # 패스트푸드 브랜드 관련
        elif any(brand in keyword for brand in ["맥도날드", "버거킹", "롯데리아", "맘스터치"]) and \
             any(brand in text for brand in ["맥도날드", "버거킹", "롯데리아", "맘스터치"]):
            found_keywords.add(keyword)
        # 아이스크림 브랜드 관련
        elif any(brand in keyword for brand in ["베스킨라빈스", "배스킨라빈스", "하겐다즈", "벤앤제리스", "요아정", "라라스윗", "설빙"]) and \
             any(brand in text for brand in ["베스킨라빈스", "배스킨라빈스", "하겐다즈", "벤앤제리스", "요아정", "라라스윗", "설빙"]):
            found_keywords.add(keyword)
        # 도넛 브랜드 관련
        elif ("던킨도너츠" in keyword or "크리스피크림" in keyword) and \
             ("던킨도너츠" in text or "크리스피크림" in text):
            found_keywords.add(keyword)
        # 편의점 브랜드 관련
        elif any(brand in keyword for brand in ["세븐일레븐", "CU", "GS25", "이마트24"]) and \
             any(brand in text for brand in ["세븐일레븐", "CU", "GS25", "이마트24"]):
            found_keywords.add(keyword)
            
        # 아이스크림 제품 관련
        elif "메로나" in keyword and "메로나" in text:
            found_keywords.add(keyword)
        # 빵 관련 (특정 빵 이름 제외)
        elif "빵" in keyword and "빵" in text:
            # 특정 빵 이름들은 별도 키워드로 처리
            specific_breads = ["소금빵", "메론빵", "중국식빵", "포켓몬빵", "마늘빵", "바나나빵"]
            if not any(specific in text for specific in specific_breads):
                found_keywords.add(keyword)
        # 마시멜로 관련 (표기 변형 처리)
        elif ("마시멜로" in keyword or "마쉬멜로" in keyword) and \
             ("마시멜로" in text or "마쉬멜로" in text):
            found_keywords.add(keyword)
        # 수건케이크 관련 (다양한 표기 처리)
        elif any(cake_type in keyword for cake_type in ["수건케이크", "수건케익", "마오쥔젤", "마오진젤"]) and \
             any(cake_type in text for cake_type in ["수건케이크", "수건케익", "마오쥔젤", "마오진젤"]):
            found_keywords.add(keyword)
        # 과일 관련
        # 과일 관련
        elif any(fruit in keyword for fruit in ["망고", "딸기", "바나나", "사과", "멜론", "수박"]) and \
            any(fruit in text for fruit in ["망고", "딸기", "바나나", "사과", "멜론", "수박"]):
            found_keywords.add(keyword)
        # 민트초코 관련 (모든 표기 변형을 "민트초코"로 통합)
        elif "민트초코" in keyword and \
             any(mint_variant in text for mint_variant in ["민트초코", "민트쵸코", "민트초콜릿", "민초", "민초단"]):
            found_keywords.add(keyword)
        # 빙산롱옌 관련
        elif "빙산롱옌" in keyword and "빙산롱옌" in text:
            found_keywords.add(keyword)
        # 쫀득쿠키 관련 (모든 변형을 "쫀득쿠키"로 통합)
        elif "쫀득쿠키" in keyword and \
             any(chewy_variant in text for chewy_variant in ["쫀득쿠키", "쫀득쿠", "쫀득쿠키로", "쫜득쿠키"]):
            found_keywords.add(keyword)
        # 초콜릿 관련 (초코 변형 포함)
        elif "초콜릿" in keyword and \
             any(choco_variant in text for choco_variant in ["초콜릿", "초코"]):
            found_keywords.add(keyword)
        # 카다이프 관련
        elif "카다이프" in keyword and "카다이프" in text:
            found_keywords.add(keyword)
        # 브륄레 관련
        elif "브륄레" in keyword and "브륄레" in text:
            found_keywords.add(keyword)
        # 티라미수케이크 관련
        elif "티라미수케이크" in keyword and "티라미수" in text:
            found_keywords.add(keyword)
        # 파삭 관련
        elif "파삭" in keyword and \
             any(crispy_variant in text for crispy_variant in ["파삭", "파사삭", "파삭쿠키"]):
            found_keywords.add(keyword)
        # 컵빙 관련 (팥빙 복합 디저트들만)
        elif "컵빙" in keyword and \
             any(cupbing_variant in text for cupbing_variant in ["컵빙", "팥빙젤라또", "팥빙프라페"]):
            found_keywords.add(keyword)
        # 피스타치오 관련
        elif "피스타치오" in keyword and "피스타치오" in text:
            found_keywords.add(keyword)
        # 하리보 관련
        elif "하리보" in keyword and "하리보" in text:
            found_keywords.add(keyword)
        # 핫치즈빅싸이 관련
        elif "핫치즈빅싸이" in keyword and \
             any(hotcheese_variant in text for hotcheese_variant in ["핫치즈빅싸이", "핫치즈싸이", "핫치즈싸"]):
            found_keywords.add(keyword)
        # 고추바사삭 관련
        elif "고추바사삭" in keyword and \
             any(pepper_variant in text for pepper_variant in ["고추바사삭", "고추바바삭"]):
            found_keywords.add(keyword)
        # 까르보불닭 관련
        elif "까르보불닭" in keyword and \
             any(carbo_variant in text for carbo_variant in ["까르보불닭", "까르보불"]):
            found_keywords.add(keyword)
        # 꼬치 관련
        elif "꼬치" in keyword and \
             any(skewer_variant in text for skewer_variant in ["꼬치", "꼬치구이"]):
            found_keywords.add(keyword)
        # 두바이초콜릿 관련 (초코 변형 포함)
        elif "두바이초콜릿" in keyword and \
             any(dubai_variant in text for dubai_variant in ["두바이초콜릿", "두바이초코"]):
            found_keywords.add(keyword)
        # 하이디라오 관련
        elif "하이디라오" in keyword and \
             any(haidilao_variant in text for haidilao_variant in ["하이디라오", "하이디"]):
            found_keywords.add(keyword)
        # 핫뿌링클 관련
        elif "핫뿌링클" in keyword and \
             any(hotsprinkle_variant in text for hotsprinkle_variant in ["핫뿌링클", "핫뿌링클에"]):
            found_keywords.add(keyword)
        # 달고나크로플 관련 (예시)
        elif "달고나크로플" in keyword and \
             any(dalgona_variant in text for dalgona_variant in ["달고나크로플", "달고나크로플레", "달크로플"]):
            found_keywords.add(keyword)

    return found_keywords

# 8. 텍스트 데이터 수집 및 키워드 추출 ----------------------------------
print("📂 텍스트 데이터 수집 중...")

# 모든 텍스트 수집
all_texts = []
for f in insta_files:
    all_texts.extend(extract_text_from_insta(f))
for f in yt_files:
    all_texts.extend(extract_text_from_yt(f))

# 중복 제거 및 전처리
all_texts = list({t.strip() for t in all_texts if t and len(t.strip()) > 0})
print(f"✅ 총 {len(all_texts)}개 텍스트 수집 완료")

# 키워드 추출 시작
print("\n🔍 키워드 추출 시작...")
keywords = set(initial_keywords)  # 이미 구축된 사용자 정의 키워드로 시작

# 1) 텍스트에서 사용자 정의 키워드 매칭 확인
print("🎯 텍스트에서 사용자 정의 키워드 매칭 확인 중...")
matched_predefined = set()
for text in all_texts:
    found_keywords = check_predefined_keywords(text)
    matched_predefined.update(found_keywords)

print(f"✅ 실제 텍스트에서 발견된 사용자 정의 키워드: {len(matched_predefined)}개")

# 2) AI 분류기로 추가 키워드 추출 (사용자 사전 활용)
print("🤖 형태소 분석 + AI 분류기로 추가 키워드 추출 중...")
ai_found = 0
for text in all_texts:
    # 안전한 텍스트만 처리
    if not is_safe_text(text):
        continue

    # Komoran 명사 (오류 처리 추가)
    kom_nouns = []
    try:
        if text and len(text.strip()) > 0:
            kom_nouns = komoran.nouns(text)
    except (UnicodeDecodeError, UnicodeEncodeError, Exception) as e:
        # 인코딩 오류 시 무시하고 계속
        pass

    # KiwiPiey 명사
    kiwi_nouns = []
    try:
        if text and len(text.strip()) > 0:
            kiwi_tokens = kiwi.tokenize(text)
            kiwi_nouns = [tok.form for tok in kiwi_tokens if tok.tag in ('NNG','NNP')]
    except Exception:
        pass

    # 합집합 사용 (별도 normalization 없음)
    merged = set(kom_nouns) | set(kiwi_nouns)

    for w in merged:
        # 이미 사용자 정의 키워드에 포함된 경우 스킵
        if w in keywords:
            continue

        # 순수 한글, 길이 2 이상만 추출
        if not (len(w) >= 2 and re.match(r'^[가-힣]+$', w)):
            continue

        # Zero-shot 분류기 (multi-label)로 food 여부 판단
        try:
            out = classifier(
                w,
                candidate_labels=["food","dessert","snack","beverage","meal","korean food","non-food"],
                multi_label=True
            )
            # 'non-food' 이외의 레이블 중 하나라도 threshold 이상이면 키워드로 추가
            for label, score in zip(out['labels'], out['scores']):
                if label != 'non-food' and score >= threshold:
                    keywords.add(w)
                    ai_found += 1
                    break
        except Exception as e:
            # AI 분류 실패 시 무시하고 계속
            continue

print(f"✅ AI 분류기로 {ai_found}개 추가 키워드 발견")

# 9. 최종 사용자 사전 업데이트 ----------------------------------------
print(f"\n📝 최종 사용자 사전 업데이트 중...")

# 사용자 정의 키워드와 AI 추출 키워드 분리
predefined_set = get_predefined_food_keywords()
user_defined = keywords & predefined_set
ai_extracted = keywords - predefined_set

# Komoran 사용자 사전 포맷: 단어<TAB>품사<TAB>빈도
with open(userdic_path, 'w', encoding='utf-8') as wf:
    # 사용자 정의 키워드는 높은 우선순위 (빈도 9999)
    for word in sorted(user_defined):
        if word and len(word) >= 2 and all(ord('가') <= ord(c) <= ord('힣') for c in word):
            wf.write(f"{word}\tNNG\t9999\n")

    # AI 추출 키워드는 중간 우선순위 (빈도 5000)
    for word in sorted(ai_extracted):
        if word and len(word) >= 2 and all(ord('가') <= ord(c) <= ord('힣') for c in word):
            wf.write(f"{word}\tNNG\t5000\n")

print(f"✅ 최종 사용자 사전 업데이트 완료: {userdic_path}")
print(f"\n📊 최종 통계:")
print(f"   - 사용자 정의 키워드 (우선순위 9999): {len(user_defined)}개")
print(f"   - AI 추출 키워드 (우선순위 5000): {len(ai_extracted)}개")
print(f"   - 총 음식 키워드: {len(keywords)}개")
print(f"   - 실제 텍스트에서 매칭된 사용자 정의 키워드: {len(matched_predefined)}개")

# 실제 매칭된 사용자 정의 키워드 출력
if matched_predefined:
    print(f"\n🎯 실제 텍스트에서 발견된 사용자 정의 키워드:")
    for word in sorted(matched_predefined):
        print(f"   - {word}")

print(f"\n🎉 사용자 사전 구축 완료!")
print(f"💡 이제 '{userdic_path}' 파일을 사용하여 더 정확한 음식 키워드 분석이 가능합니다.")
