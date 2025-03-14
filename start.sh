#!/bin/bash

cd "$(dirname "$0")"


# 만약 main 필드가 없거나 추출되지 않았다면 기본값 설정
if [ -z "$MAIN_FILE" ]; then
    echo "package.json에서 main 파일을 찾을 수 없습니다. 기본값으로 src/index.js를 실행합니다."
    MAIN_FILE="src/index.js"
fi

node --experimental-specifier-resolution=node "$MAIN_FILE"

echo ""
echo "계속하려면 아무 키나 누르세요..."
read -n 1 -s
