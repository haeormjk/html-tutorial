# 우리동네 날씨 & 미세먼지 알림판

실시간 날씨 정보와 미세먼지 수치를 확인할 수 있는 웹 애플리케이션입니다.

## 기능

- 사용자 현재 위치 기반 날씨 정보 표시
- 실시간 미세먼지(PM10) 및 초미세먼지(PM2.5) 수치 표시
- 10분마다 자동 업데이트
- 반응형 디자인 (모바일/태블릿/데스크톱 지원)

## 기술 스택

- HTML5
- CSS3
- Vanilla JavaScript (프레임워크 없음)

## 시작하기

### 1. API 키 발급

#### OpenWeatherMap API
1. [OpenWeatherMap](https://openweathermap.org/) 회원가입
2. API Keys 메뉴에서 무료 API 키 발급
3. 무료 플랜: 하루 1,000회 호출 가능

#### 에어코리아 API (공공데이터포털)
1. [공공데이터포털](https://www.data.go.kr/) 회원가입
2. '한국환경공단_에어코리아_대기오염정보' 검색
3. 활용신청 (승인까지 약 1일 소요)

### 2. 설정 파일 생성

```bash
# config.example.js를 config.js로 복사
cp config.example.js config.js
```

`config.js` 파일을 열어 발급받은 API 키를 입력하세요:

```javascript
const CONFIG = {
    OPENWEATHER_API_KEY: '발급받은_OpenWeatherMap_API_키',
    AIR_KOREA_API_KEY: '발급받은_에어코리아_API_키'
};
```

### 3. 로컬에서 실행

브라우저에서 `index.html` 파일을 열거나, VS Code의 Live Server 확장을 사용하세요.

```bash
# VS Code에서
# 1. Live Server 확장 설치
# 2. index.html 우클릭 > "Open with Live Server"
```

## 프로젝트 구조

```
realtime_api/
├── index.html          # 메인 HTML 파일
├── style.css           # 스타일시트
├── script.js           # JavaScript 로직
├── config.js           # API 키 설정 (Git에 포함되지 않음)
├── config.example.js   # API 키 설정 예시
├── .gitignore          # Git 제외 파일 목록
├── CLAUDE.md          # Claude Code 가이드
├── initial.md          # 프로젝트 기획서
└── README.md          # 이 파일
```

## 배포

### GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

GitHub 저장소 Settings > Pages에서 배포 설정

### Netlify

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
netlify deploy --prod
```

## 주의사항

- `config.js` 파일은 절대 Git에 커밋하지 마세요 (API 키 노출 위험)
- 위치 권한을 허용해야 정확한 위치 기반 정보를 받을 수 있습니다
- HTTPS 환경에서만 Geolocation API가 작동합니다 (localhost는 예외)

## 라이선스

MIT License

## 데이터 출처

- 날씨 정보: [OpenWeatherMap](https://openweathermap.org/)
- 미세먼지 정보: [한국환경공단 에어코리아](https://www.airkorea.or.kr/)
