/**
 * API 키 설정 파일 예시
 *
 * 사용 방법:
 * 1. 이 파일을 'config.js'로 복사하세요
 * 2. 각 API 키를 실제 키로 교체하세요
 * 3. config.js는 절대 Git에 커밋하지 마세요 (.gitignore에 포함됨)
 */

const CONFIG = {
    // OpenWeatherMap API 키
    // 발급 방법: https://openweathermap.org/api
    // 1. OpenWeatherMap 회원가입
    // 2. API Keys 메뉴에서 키 생성
    // 3. 무료 플랜: 하루 1,000회 호출 가능
    OPENWEATHER_API_KEY: 'YOUR_OPENWEATHERMAP_API_KEY_HERE',

    // 공공데이터포털 API 키 (한국환경공단 에어코리아)
    // 발급 방법: https://www.data.go.kr/
    // 1. 공공데이터포털 회원가입
    // 2. '한국환경공단_에어코리아_대기오염정보' 검색
    // 3. 활용신청 (승인까지 1일 소요)
    AIR_KOREA_API_KEY: 'YOUR_AIR_KOREA_API_KEY_HERE'
};

// 설정 검증
if (CONFIG.OPENWEATHER_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE' ||
    CONFIG.AIR_KOREA_API_KEY === 'YOUR_AIR_KOREA_API_KEY_HERE') {
    console.warn('⚠️ API 키를 설정해주세요!');
    console.warn('config.example.js를 config.js로 복사한 후 실제 API 키를 입력하세요.');
}
