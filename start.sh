#!/bin/bash

# 현재 스크립트 파일의 디렉토리로 이동
cd "$(dirname "$0")"

# Node.js 실행 (ES6 모듈 지원)
node --experimental-specifier-resolution=node --input-type=module src/index.js

# 줄 바꿈 후 메시지 출력
echo ""
echo "계속하려면 아무 키나 누르세요..."
read -n 1 -s
