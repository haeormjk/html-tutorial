오늘 만들 프로젝트 : 우리동네 날씨 실시간 파악 & 미세먼지 알림판.

필요한것들 :

## 1. 사용할 API 목록

### 1.1 날씨 API (OpenWeatherMap 추천)
**선택 이유**: 가장 쉽고 빠르게 구현 가능, 무료 플랜 제공, 한국 지역 지원
- **서비스**: OpenWeatherMap API
- **웹사이트**: https://openweathermap.org/
- **가입 방법**: 무료 회원가입 후 API Key 발급
- **무료 플랜**: 하루 1,000회 API 호출 무료
- **제공 데이터**:
  - 현재 날씨 (온도, 습도, 풍속)
  - 날씨 상태 (맑음, 흐림, 비 등)
  - 날씨 아이콘
  - 5일 예보
- **API 호출 예시**:
  ```
  https://api.openweathermap.org/data/2.5/weather?lat={위도}&lon={경도}&appid={API_KEY}&units=metric&lang=kr
  ```

**대안 (더 정확한 한국 날씨 필요시)**:
- 기상청 단기예보 API (공공데이터포털)
- 승인까지 1일 소요, 무료 사용
- https://www.data.go.kr/data/15084084/openapi.do

### 1.2 미세먼지 API (한국환경공단 에어코리아)
**선택**: 한국환경공단 에어코리아 대기오염정보 API
- **서비스**: 공공데이터포털 - 한국환경공단 에어코리아
- **웹사이트**: https://www.data.go.kr/data/15073861/openapi.do
- **가입 방법**: 공공데이터포털 회원가입 후 활용신청
- **무료**: 완전 무료
- **제공 데이터**:
  - 실시간 측정정보 (PM10, PM2.5)
  - 통합대기환경지수
  - 측정소별 정보
  - 예보 정보
- **API 호출 예시**:
  ```
  http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?stationName={측정소명}&dataTerm=DAILY&pageNo=1&numOfRows=1&returnType=json&serviceKey={API_KEY}
  ```

### 1.3 위치 정보 API (Geolocation API)
**선택**: HTML5 Geolocation API (내장)
- **비용**: 완전 무료 (브라우저 내장 기능)
- **제공 데이터**: 사용자의 현재 위도/경도
- **사용 예시**:
  ```javascript
  navigator.geolocation.getCurrentPosition(function(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
  });
  ```

## 2. MVP 기술 스택 (가장 쉬운 구현 방법)

### 2.1 프론트엔드
- **HTML5**: 기본 구조
- **CSS3**: 스타일링 (반응형 디자인)
- **Vanilla JavaScript**: API 호출 및 데이터 처리
- **추가 라이브러리 불필요**: 순수 웹 기술만으로 구현

### 2.2 백엔드
- **없음**: 백엔드 서버 불필요 (정적 웹페이지로 구현)
- **API 직접 호출**: 클라이언트에서 직접 API 호출

### 2.3 배포
- **GitHub Pages**: 무료 정적 호스팅
- **Netlify**: 무료, 간단한 배포
- **Vercel**: 무료, 자동 배포

## 3. 구현 단계 (MVP)

### Step 1: 프로젝트 기본 구조
```
project/
├── index.html
├── style.css
└── script.js
```

### Step 2: API Key 발급
1. OpenWeatherMap 가입 및 API Key 발급 (5분)
2. 공공데이터포털 가입 및 에어코리아 API Key 발급 (승인까지 1일)

### Step 3: 기능 구현 순서
1. **위치 정보 가져오기** (30분)
   - Geolocation API로 사용자 위치 확인
   - 사용자 동의 처리

2. **날씨 정보 표시** (1시간)
   - OpenWeatherMap API 호출
   - 현재 온도, 날씨 상태, 아이콘 표시

3. **미세먼지 정보 표시** (1시간)
   - 에어코리아 API 호출
   - PM10, PM2.5 수치 및 등급 표시

4. **UI 디자인** (1시간)
   - 깔끔한 카드 형태 디자인
   - 미세먼지 등급별 색상 표시
   - 반응형 디자인

5. **자동 새로고침** (30분)
   - 10분마다 자동 업데이트

### Step 4: 테스트 및 배포
- 로컬에서 테스트
- GitHub Pages 또는 Netlify에 배포

## 4. 핵심 코드 구조

### 4.1 HTML 기본 구조
```html
<!DOCTYPE html>
<html>
<head>
    <title>우리동네 날씨 & 미세먼지</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>우리동네 날씨 & 미세먼지</h1>
        <div id="location"></div>
        <div id="weather"></div>
        <div id="air-quality"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

### 4.2 JavaScript 핵심 로직
```javascript
// 1. 위치 정보 가져오기
navigator.geolocation.getCurrentPosition(successCallback);

// 2. 날씨 API 호출
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`)
    .then(response => response.json())
    .then(data => displayWeather(data));

// 3. 미세먼지 API 호출
fetch(`http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/...`)
    .then(response => response.json())
    .then(data => displayAirQuality(data));
```

## 5. 예상 소요 시간
- **총 개발 시간**: 4-5시간 (MVP)
- **API 승인 대기**: 1일 (에어코리아)
- **배포**: 10분

## 6. 주의사항
- API Key는 코드에 직접 노출하지 않기 (GitHub 공개 저장소 주의)
- CORS 이슈 발생 시 서버 없이 해결 가능한 방법 사용
- 사용자 위치 권한 거부 시 대체 방안 (기본 도시 설정)

## 7. MVP 완성 후 추가 기능 (선택사항)
- 주간 날씨 예보
- 위치 직접 검색 기능
- 즐겨찾기 위치 저장
- 알림 설정 (미세먼지 나쁨 시)