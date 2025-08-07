

"""
Test.py - 식문화 사용자 사전 생성 스크립트

이 스크립트는 인스타그램(POST_TEXT, HASHTAGS) 및 유튜브(TITLE) 데이터를 수집해,
세 가지 형태소 분석기(Komoran, SentencePiece, Kiwi)로 명사 후보를 추출한 뒤
통합하여 Komoran userdic 포맷의 사용자 사전(user_dictionary.txt)을 생성합니다.

---
# 활용 방법
1. 경로 설정 확인:
   - 이 파일 위치 기준으로 `DB_ROOT` 가 DataAnalysis/DB 폴더를 가리키는지 확인합니다.
   - `INSTAR_DIR`, `YOUTUBE_DIR` 에 원본 CSV가 있는지 로그([DEBUG])로 확인하세요.
2. 의존성 설치 (한 번만):
   ```bash
   pip install pandas konlpy kiwipiepy sentencepiece
   ```
3. 실행:
   ```bash
   python test.py
   ```
4. 출력:
   - `키워드_언급량/user_dictionary.txt` 에 Komoran userdic 형식으로 단어 목록과 품사가 저장됩니다.

---
# 추후 응용 방안
- **데이터 소스 확장**: TikTok, 블로그 등 추가적인 CSV 디렉터리를 `load_corpus`에 연결
- **분석기 교체/추가**: Okt, Mecab 등 다른 형태소 분석기 모듈을 추출 함수로 추가
- **후처리 로직**: 추출된 후보 빈도 기반 필터, 중요도 가중치 추가, 사용자 사전 자동 업데이트 워크플로우 구성
- **자동화**: CI/CD 파이프라인에 통합하여 주기적으로 새로운 데이터를 반영하고 사전 갱신
- **시각화**: 추출된 키워드 빈도 시각화를 위한 Matplotlib/Plotly 차트 추가

모듈화된 함수 구조를 기반으로, 필요에 따라 **입력**, **추출**, **저장** 파트를 간단히 확장할 수 있습니다.

"""

import pandas as pd
from pathlib import Path
from konlpy.tag import Komoran
from kiwipiepy import Kiwi
import sentencepiece as spm
from collections import Counter

# —————— 1) 경로 설정 및 존재 확인 ——————
HERE        = Path(__file__).resolve().parent
# test.py 위치에서 2단계 위가 DataAnalysis/DB
DB_ROOT     = HERE.parents[2]                            # .../DataAnalysis/DB
INSTAR_DIR  = DB_ROOT / 'DB' / 'all' / 'instar'
YOUTUBE_DIR = DB_ROOT / 'DB' / 'all' / 'youtube'

print(f"[DEBUG] DB_ROOT:    {DB_ROOT} exists? {DB_ROOT.exists()}")
print(f"[DEBUG] Instar dir: {INSTAR_DIR} exists? {INSTAR_DIR.exists()}")
print(f"[DEBUG] YouTube dir:{YOUTUBE_DIR} exists? {YOUTUBE_DIR.exists()}")

# SentencePiece 입력 및 출력 경로
SPM_INPUT      = HERE / 'spm_train.txt'
SPM_MODEL_PREF = HERE / 'spm_food'
# 사용자 사전 저장 디렉토리 및 파일
USERDIC_DIR    = HERE / '키워드_언급량'
USERDIC_FILE   = USERDIC_DIR / 'user_dictionary.txt'

# —————— 2) 말뭉치 로드 (instar 및 youtube 폴더 내 최상위 CSV만) ——————
def load_corpus(instar_dir: Path, youtube_dir: Path):
    texts = []

    # 인스타 CSV (최상위)
    instar_files = list(instar_dir.glob('*.csv'))
    print(f"[DEBUG] Instar CSV 파일 {len(instar_files)}개 발견 (하위 폴더 제외)")
    for p in instar_files:
        print("  ▶ Instar CSV:", p)
                # 파일을 직접 열어 디코딩 오류를 회피
        with open(p, 'r', encoding='utf-8-sig', errors='replace') as f:
            df = pd.read_csv(f)
        cols = df.columns.tolist()
        text_col = 'POST_TEXT' if 'POST_TEXT' in cols else ('본문' if '본문' in cols else None)
        tag_col  = 'HASHTAGS'  if 'HASHTAGS'  in cols else ('해시태그' if '해시태그' in cols else None)
        if not text_col:
            print(f"   ⚠️ 본문 컬럼을 찾을 수 없습니다: {cols}")
            continue

        for _, row in df.iterrows():
            post = str(row[text_col]).strip()
            if post:
                texts.append(post)
            if tag_col:
                for t in str(row[tag_col]).split(','):
                    t = t.strip().lstrip('#')
                    if t:
                        texts.append(t)

    # 유튜브 CSV (최상위)
    yt_files = list(youtube_dir.glob('*.csv'))
    print(f"[DEBUG] YouTube CSV 파일 {len(yt_files)}개 발견 (하위 폴더 제외)")
    for p in yt_files:
        print("  ▶ YouTube CSV:", p)
                # 파일을 직접 열어 디코딩 오류를 회피
        with open(p, 'r', encoding='utf-8-sig', errors='replace') as f:
            df = pd.read_csv(f)
        cols = df.columns.tolist()
        title_col = 'TITLE' if 'TITLE' in cols else ('제목' if '제목' in cols else None)
        if not title_col:
            print(f"   ⚠️ 제목 컬럼을 찾을 수 없습니다: {cols}")
            continue

        for t in df[title_col]:
            t = str(t).strip()
            if t:
                texts.append(t)

    texts = [s for s in texts if s]
    print(f"[DEBUG] 최종 말뭉치 문장 수: {len(texts)}")
    return texts

# —————— 3) Komoran 후보 추출 ——————
def extract_candidates_komoran(texts, min_freq=5):
    komoran = Komoran()
    ctr = Counter()
    for raw in texts:
        # 텍스트 클리닝: invalid utf-8 제거
        txt = raw.encode('utf-8', errors='ignore').decode('utf-8', errors='ignore')
        try:
            for w, tag in komoran.pos(txt):
                if tag in ('NNG','NNP') and len(w) >= 2:
                    ctr[w] += 1
        except Exception as e:
            # 에러 발생 시 로그만 출력하고 넘어감
            print(f"⚠️ Komoran 처리 오류: {e} for text: {txt[:30]}")
    return {w for w,c in ctr.items() if c >= min_freq}

# —————— 4) SentencePiece 학습 & 후보 추출 ——————
def train_spm(texts, input_path: Path, model_pref: Path, vocab_size=8000):
    with open(input_path, 'w', encoding='utf-8') as fw:
        for line in texts:
            fw.write(line.replace('\n',' ') + '\n')
    spm.SentencePieceTrainer.Train(
        f"--input={input_path} "
        f"--model_prefix={model_pref} "
        f"--vocab_size={vocab_size} "
        f"--model_type=bpe "
        f"--character_coverage=0.9995"
    )
    sp = spm.SentencePieceProcessor()
    sp.Load(str(model_pref) + ".model")
    return sp

def extract_candidates_spm(sp, texts, min_freq=5):
    ctr = Counter()
    for raw in texts:
        txt = raw.encode('utf-8', errors='ignore').decode('utf-8', errors='ignore')
        for piece in sp.EncodeAsPieces(txt):
            if piece.startswith('▁') and len(piece.replace('▁','')) >= 2:
                w = piece.replace('▁','')
                ctr[w] += 1
    return {w for w,c in ctr.items() if c >= min_freq}

# —————— 5) Kiwi 후보 추출 ——————
def extract_candidates_kiwi(texts, score_threshold=0.6):
    kiwi = Kiwi(model_type='sbg')
    ctr = Counter()
    for txt in texts:
        # 상위 분석 결과 1개 사용
        analyses = kiwi.analyze(txt, top_n=5)[0]
        for token in analyses:
            # Kiwi returns tuples of form (surface, begin, length, tag, score)
            try:
                surface, begin, length, tag, score = token
            except ValueError:
                # Fallback: if structure differs, assume last two elements are tag and score
                surface = token[0]
                tag = token[-2]
                score = token[-1]
            if tag in ('NNG','NNP') and len(surface) >= 2 and score >= score_threshold:
                ctr[surface] += 1
    return set(ctr.keys())

# —————— 6) 사용자 사전 저장 —————— ——————
def build_userdic(candidates, filepath: Path, pos_tag='NNG'):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as fw:
        for w in sorted(candidates):
            fw.write(f"{w}\t{pos_tag}\n")
    print(f"[완료] 사용자 사전 {len(candidates)}개 → {filepath}")

# —————— 메인 함수 ——————
def main():
    print("1) 말뭉치 로드 중…")
    texts = load_corpus(INSTAR_DIR, YOUTUBE_DIR)
    print(f"   → 문장 수: {len(texts)}")

    print("2) Komoran 후보 추출…")
    c1 = extract_candidates_komoran(texts)
    print(f"   Komoran: {len(c1)}개")

    print("3) SentencePiece 학습 및 후보 추출…")
    sp = train_spm(texts, SPM_INPUT, SPM_MODEL_PREF)
    c2 = extract_candidates_spm(sp, texts)
    print(f"   SPM: {len(c2)}개")

    print("4) Kiwi 후보 추출…")
    c3 = extract_candidates_kiwi(texts)
    print(f"   Kiwi: {len(c3)}개")

    print("5) 통합 및 저장…")
    all_cands = c1 | c2 | c3
    build_userdic(all_cands, USERDIC_FILE)

if __name__ == '__main__':
    main()
