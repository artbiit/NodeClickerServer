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
    reason TEXT NOT NULL,                       -- 해당 유저가 밴 당한 이유
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