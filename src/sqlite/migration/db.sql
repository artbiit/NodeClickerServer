-- user 테이블 (유저 정보)
CREATE TABLE IF NOT EXISTS user (
    seq_no INTEGER PRIMARY KEY AUTOINCREMENT,  -- 클러스터 인덱스, 기본키
    user_name TEXT UNIQUE NOT NULL,            -- 유저 계정 (유니크 제약)
    password TEXT NOT NULL,                     -- 비밀번호
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 가입한 시기
);

-- session 테이블 (로그인 상태 관리)
CREATE TABLE IF NOT EXISTS session (
    session_id TEXT PRIMARY KEY,           -- 세션 ID (UUID 등)
    user_seq_no INTEGER NOT NULL,          -- user 테이블의 seq_no 참조
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 로그인 시점
    expires_at DATETIME NOT NULL,          -- 세션 만료 시각
    user_agent TEXT,                        -- 로그인한 디바이스 정보
    ip_address TEXT,                        -- 로그인한 IP 주소
    FOREIGN KEY (user_seq_no) REFERENCES user(seq_no) ON DELETE CASCADE
);


-- ban 테이블 (실격된 유저 목록)
CREATE TABLE IF NOT EXISTS ban (
    user_seq_no INTEGER NOT NULL PRIMARY KEY,  -- user 테이블의 seq_no 참조 (기본키)
    user_name TEXT NOT NULL,                    -- user 테이블의 user_name 참조
    banned_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 실격 시기
    FOREIGN KEY (user_seq_no) REFERENCES user(seq_no) ON DELETE CASCADE
);

-- attempt 테이블 (유저별 이벤트 참여 정보)
CREATE TABLE IF NOT EXISTS attempt (
    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 개별 시도 식별자
    user_seq_no INTEGER NOT NULL,                 -- user 테이블의 seq_no 참조
    started_at DATETIME NOT NULL,                 -- 시도 시작 시기
    last_click_at DATETIME,                        -- 마지막 클릭 시기 (10초 inactivity 감지용)
    ended_at DATETIME,                             -- 종료 시기 (성공/실패 포함)
    success BOOLEAN DEFAULT 0,                     -- 이벤트 성공 여부
    total_clicks INTEGER DEFAULT 0,               -- 전체 클릭 횟수
    FOREIGN KEY (user_seq_no) REFERENCES user(seq_no) ON DELETE CASCADE
);

-- 클릭 요약 테이블 (초당 클릭 횟수만 저장)
CREATE TABLE IF NOT EXISTS click_summary (
    attempt_id INTEGER NOT NULL,                  -- attempt 테이블의 attempt_id 참조
    user_seq_no INTEGER NOT NULL,                 -- user 테이블의 seq_no 참조
    click_second INTEGER NOT NULL,                -- 클릭이 발생한 초 단위 (슬라이딩 윈도우 검증용)
    click_count INTEGER NOT NULL DEFAULT 0,       -- 해당 초 내 클릭 횟수
    PRIMARY KEY (attempt_id, click_second),       -- 같은 초에 대한 중복 저장 방지
    FOREIGN KEY (attempt_id) REFERENCES attempt(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (user_seq_no) REFERENCES user(seq_no) ON DELETE CASCADE
);
