// 전역 변수
let userLocation = {
    lat: null,
    lon: null,
    city: null
};

// 서울 기본 좌표 (위치 권한 거부 시 사용)
const DEFAULT_LOCATION = {
    lat: 37.5665,
    lon: 126.9780,
    city: '서울'
};

// 자동 업데이트 간격 (10분)
const AUTO_UPDATE_INTERVAL = 10 * 60 * 1000;
let updateInterval = null;

/* ==========================================
   DOM 요소 선택
   ========================================== */

// 위치 관련 DOM 요소
const locationSelect = document.getElementById('location-select');

// 3일 날씨 카드 DOM 요소
const weatherToday = document.getElementById('weather-today');
const weatherTomorrow = document.getElementById('weather-tomorrow');
const weatherDayAfter = document.getElementById('weather-dayafter');
const lastUpdateElement = document.getElementById('last-update');
const refreshBtn = document.getElementById('refresh-btn');

// 다크모드 토글 요소
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

/* ==========================================
   앱 초기화
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('앱 초기화 시작...');

    // 다크모드 설정 로드
    loadThemePreference();

    // 앱 메인 기능 초기화
    initApp();

    // 이벤트 리스너 등록
    setupEventListeners();
});

/* ==========================================
   이벤트 리스너 설정
   ========================================== */

function setupEventListeners() {
    // 새로고침 버튼 클릭 이벤트
    refreshBtn.addEventListener('click', () => {
        console.log('수동 새로고침 요청');
        refreshBtn.classList.add('loading');
        fetchAllData();
    });

    // 다크모드 토글 버튼 클릭 이벤트
    themeToggle.addEventListener('click', toggleTheme);

    // 지역 선택 드롭다운 이벤트
    locationSelect.addEventListener('change', handleLocationChange);
}

/* ==========================================
   다크모드 관련 함수
   ========================================== */

/**
 * 테마 전환 함수
 * 라이트모드 ↔ 다크모드 토글
 */
function toggleTheme() {
    // 현재 테마 확인
    const currentTheme = document.documentElement.getAttribute('data-theme');

    // 테마 전환
    if (currentTheme === 'dark') {
        // 다크모드 → 라이트모드
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';  // 태양 아이콘
        localStorage.setItem('theme', 'light');
        console.log('라이트모드로 전환');
    } else {
        // 라이트모드 → 다크모드
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '🌙';  // 달 아이콘
        localStorage.setItem('theme', 'dark');
        console.log('다크모드로 전환');
    }
}

/**
 * 저장된 테마 설정 불러오기
 * 로컬 스토리지에서 사용자의 이전 테마 설정을 복원
 */
function loadThemePreference() {
    // 로컬 스토리지에서 저장된 테마 가져오기
    const savedTheme = localStorage.getItem('theme');

    // 저장된 테마가 없으면 시스템 설정 확인
    if (!savedTheme) {
        // 시스템 다크모드 선호도 확인
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', theme);
        themeIcon.textContent = prefersDark ? '🌙' : '☀️';

        console.log(`시스템 설정에 따라 ${theme}모드 적용`);
    } else {
        // 저장된 테마 적용
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

        console.log(`저장된 테마 ${savedTheme}모드 적용`);
    }
}

/**
 * 앱 초기화
 */
function initApp() {
    getUserLocation();
    setupAutoUpdate();
}

/**
 * 지역 선택 변경 핸들러
 */
function handleLocationChange() {
    const selectedValue = locationSelect.value;

    console.log('지역 선택 변경:', selectedValue);

    if (selectedValue === 'auto') {
        // 자동 위치 감지
        getUserLocation();
    } else {
        // 수동 선택된 위치 사용
        const [lat, lon] = selectedValue.split(',').map(Number);
        userLocation.lat = lat;
        userLocation.lon = lon;

        console.log('수동 선택 위치:', { lat, lon });

        // 선택된 위치로 데이터 가져오기
        fetchAllData();
    }
}

/**
 * 사용자 위치 정보 가져오기
 */
function getUserLocation() {
    console.log('위치 정보 요청 중...');

    if (!navigator.geolocation) {
        console.error('Geolocation을 지원하지 않는 브라우저입니다.');
        showError('위치 정보를 지원하지 않는 브라우저입니다.');
        useDefaultLocation();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        // 성공 콜백
        (position) => {
            console.log('위치 정보 획득 성공:', position.coords);
            userLocation.lat = position.coords.latitude;
            userLocation.lon = position.coords.longitude;

            // 드롭다운을 '자동' 상태로 유지
            locationSelect.value = 'auto';

            // 모든 데이터 가져오기
            fetchAllData();
        },
        // 에러 콜백
        (error) => {
            console.error('위치 정보 획득 실패:', error);
            handleLocationError(error);
            useDefaultLocation();
        },
        // 옵션
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * 위치 오류 처리
 */
function handleLocationError(error) {
    let errorMessage = '';

    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 기본 위치(서울)로 설정합니다.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
        case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        default:
            errorMessage = '알 수 없는 오류가 발생했습니다.';
    }

    console.warn(errorMessage);
    showWarning(errorMessage);
}

/**
 * 기본 위치 사용
 */
function useDefaultLocation() {
    console.log('기본 위치(서울) 사용');
    userLocation = { ...DEFAULT_LOCATION };

    // 드롭다운을 서울로 설정
    locationSelect.value = '37.5665,126.9780';

    fetchAllData();
}

/**
 * 모든 데이터 가져오기
 */
async function fetchAllData() {
    console.log('데이터 가져오기 시작...');

    try {
        // 날씨 예보 데이터 가져오기 (3일치)
        await fetchWeatherData();

        updateLastUpdateTime();
        refreshBtn.classList.remove('loading');

        console.log('데이터 가져오기 완료');
    } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        refreshBtn.classList.remove('loading');
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

/**
 * 날씨 데이터 가져오기 (3일 예보)
 * OpenWeatherMap 5일 예보 API를 사용하여 오늘, 내일, 모레 날씨 정보 표시
 */
async function fetchWeatherData() {
    console.log('날씨 예보 데이터 가져오기...');

    try {
        // 현재 날씨 API 호출 (도시 이름 가져오기 위함)
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric&lang=kr`;
        const currentResponse = await fetch(currentWeatherUrl);

        if (!currentResponse.ok) {
            throw new Error(`현재 날씨 API 오류: ${currentResponse.status}`);
        }

        const currentData = await currentResponse.json();

        // 도시 이름 업데이트 (영어 -> 한글 변환)
        userLocation.city = currentData.name;
        const koreanCityName = convertCityNameToKorean(currentData.name);

        console.log('도시 이름:', currentData.name, '-> 한글:', koreanCityName);

        // 5일 예보 API 호출
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${userLocation.lat}&lon=${userLocation.lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric&lang=kr`;

        console.log('날씨 예보 API 호출');

        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            throw new Error(`예보 API 오류: ${forecastResponse.status} ${forecastResponse.statusText}`);
        }

        const forecastData = await forecastResponse.json();
        console.log('예보 데이터:', forecastData);

        // 3일간의 날씨 데이터 파싱
        const weatherByDay = parseForecastData(forecastData.list);

        // 오늘 날씨 (현재 날씨 데이터 사용)
        displayWeatherData({
            temp: Math.round(currentData.main.temp),
            tempMin: Math.round(currentData.main.temp_min),
            tempMax: Math.round(currentData.main.temp_max),
            description: currentData.weather[0].description,
            humidity: currentData.main.humidity,
            windSpeed: currentData.wind.speed.toFixed(1),
            icon: currentData.weather[0].icon
        }, weatherToday);

        // 내일 날씨
        displayWeatherData(weatherByDay.tomorrow, weatherTomorrow);

        // 모레 날씨
        displayWeatherData(weatherByDay.dayAfter, weatherDayAfter);

    } catch (error) {
        console.error('날씨 데이터 가져오기 실패:', error);

        // 에러 시 모든 카드에 에러 메시지 표시
        const errorData = {
            temp: '--',
            tempMin: '--',
            tempMax: '--',
            description: '날씨 정보를 불러올 수 없습니다',
            humidity: '--',
            windSpeed: '--',
            icon: '01d'
        };

        displayWeatherData(errorData, weatherToday);
        displayWeatherData(errorData, weatherTomorrow);
        displayWeatherData(errorData, weatherDayAfter);
    }
}

/**
 * 예보 데이터를 날짜별로 파싱
 * OpenWeatherMap 5일 예보는 3시간 간격 데이터를 제공
 * 각 날짜의 대표 데이터(낮 12시 기준)를 추출
 */
function parseForecastData(forecastList) {
    // 현재 날짜 정보
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 내일, 모레 날짜
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    // 각 날짜의 대표 데이터 찾기 (낮 12시 기준, 없으면 가장 가까운 시간)
    const tomorrowData = findDayData(forecastList, tomorrow);
    const dayAfterData = findDayData(forecastList, dayAfter);

    return {
        tomorrow: tomorrowData,
        dayAfter: dayAfterData
    };
}

/**
 * 특정 날짜의 대표 날씨 데이터 찾기
 * 낮 12시 데이터를 우선으로, 없으면 해당 날짜의 첫 데이터 사용
 * 해당 날짜의 최저/최고 온도도 함께 계산
 */
function findDayData(forecastList, targetDate) {
    // 해당 날짜의 모든 예보 데이터 필터링
    const dayForecasts = forecastList.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.getDate() === targetDate.getDate() &&
               itemDate.getMonth() === targetDate.getMonth() &&
               itemDate.getFullYear() === targetDate.getFullYear();
    });

    if (dayForecasts.length === 0) {
        // 데이터가 없으면 기본값 반환
        return {
            temp: '--',
            tempMin: '--',
            tempMax: '--',
            description: '데이터 없음',
            humidity: '--',
            windSpeed: '--',
            icon: '01d'
        };
    }

    // 낮 12시에 가장 가까운 데이터 찾기 (대표 날씨)
    let selectedForecast = dayForecasts[0];
    let minTimeDiff = Math.abs(new Date(selectedForecast.dt * 1000).getHours() - 12);

    for (let forecast of dayForecasts) {
        const hour = new Date(forecast.dt * 1000).getHours();
        const timeDiff = Math.abs(hour - 12);

        if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            selectedForecast = forecast;
        }
    }

    // 해당 날짜의 최저/최고 온도 계산
    let tempMin = dayForecasts[0].main.temp;
    let tempMax = dayForecasts[0].main.temp;

    for (let forecast of dayForecasts) {
        if (forecast.main.temp < tempMin) {
            tempMin = forecast.main.temp;
        }
        if (forecast.main.temp > tempMax) {
            tempMax = forecast.main.temp;
        }
    }

    // 데이터 포맷팅
    return {
        temp: Math.round(selectedForecast.main.temp),
        tempMin: Math.round(tempMin),
        tempMax: Math.round(tempMax),
        description: selectedForecast.weather[0].description,
        humidity: selectedForecast.main.humidity,
        windSpeed: selectedForecast.wind.speed.toFixed(1),
        icon: selectedForecast.weather[0].icon
    };
}

/**
 * 날씨 데이터 표시
 * Apple 스타일의 깔끔한 레이아웃으로 표시
 * @param {Object} data - 날씨 데이터 객체
 * @param {HTMLElement} targetElement - 데이터를 표시할 DOM 요소
 */
function displayWeatherData(data, targetElement) {
    // 날씨 HTML 생성 (3칼럼에 맞게 컴팩트한 디자인)
    const weatherHTML = `
        <!-- 메인 날씨 정보 (중앙 배치) -->
        <div class="weather-main">
            <!-- 날씨 아이콘 (큰 이모지) -->
            <div class="weather-icon">${getWeatherEmoji(data.icon)}</div>

            <!-- 현재 온도 (가장 눈에 띄는 요소) -->
            <div class="temperature">${data.temp}°</div>

            <!-- 날씨 설명 -->
            <div class="weather-description">${data.description}</div>

            <!-- 최저/최고 온도 (작은 글씨, 색상 구분) -->
            <div class="temp-range">
                <span class="temp-high">${data.tempMax}°</span>
                <span class="temp-low">${data.tempMin}°</span>
            </div>
        </div>

        <!-- 세부 날씨 정보 (세로 배치) -->
        <div class="weather-details">
            <!-- 습도 -->
            <div class="weather-detail">
                <div class="detail-label">💧 습도</div>
                <div class="detail-value">${data.humidity}%</div>
            </div>

            <!-- 풍속 -->
            <div class="weather-detail">
                <div class="detail-label">💨 풍속</div>
                <div class="detail-value">${data.windSpeed}<span style="font-size: 14px;">m/s</span></div>
            </div>
        </div>
    `;

    // 지정된 DOM 요소에 삽입
    targetElement.innerHTML = weatherHTML;
}

/**
 * 날씨 아이콘을 이모지로 변환
 */
function getWeatherEmoji(iconCode) {
    const emojiMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };

    return emojiMap[iconCode] || '🌤️';
}

/**
 * 영어 도시 이름을 한글로 변환
 * OpenWeatherMap API에서 받은 영어 도시명을 한글로 변환
 */
function convertCityNameToKorean(cityName) {
    // 주요 도시 영어-한글 매핑
    const cityMap = {
        // 광역시
        'Seoul': '서울',
        'Busan': '부산',
        'Daegu': '대구',
        'Incheon': '인천',
        'Gwangju': '광주',
        'Daejeon': '대전',
        'Ulsan': '울산',
        'Sejong': '세종',

        // 경기도 주요 도시
        'Seongnam-si': '성남',
        'Suwon-si': '수원',
        'Suwon': '수원',
        'Goyang-si': '고양',
        'Yongin-si': '용인',
        'Bucheon-si': '부천',
        'Ansan-si': '안산',
        'Anyang-si': '안양',
        'Namyangju': '남양주',
        'Hwaseong-si': '화성',
        'Pyeongtaek': '평택',
        'Uijeongbu-si': '의정부',
        'Siheung-si': '시흥',
        'Gimpo-si': '김포',
        'Gwangmyeong-si': '광명',
        'Gunpo-si': '군포',
        'Hanam-si': '하남',
        'Osan': '오산',
        'Icheon-si': '이천',
        'Yangju': '양주',
        'Paju': '파주',
        'Anseong': '안성',
        'Guri-si': '구리',
        'Pocheon-si': '포천',
        'Uiwang-si': '의왕',
        'Yangpyeong': '양평',
        'Yeoju': '여주',
        'Dongducheon': '동두천',
        'Gwacheon': '과천',
        'Gapyeong': '가평',
        'Yeoncheon': '연천',

        // 강원도
        'Chuncheon': '춘천',
        'Wonju': '원주',
        'Gangneung': '강릉',

        // 충청도
        'Cheongju-si': '청주',
        'Cheonan-si': '천안',

        // 전라도
        'Jeonju-si': '전주',
        'Mokpo': '목포',

        // 경상도
        'Pohang': '포항',
        'Changwon': '창원',
        'Gimhae-si': '김해',
        'Jinju-si': '진주'
    };

    // 직접 매핑되는 경우
    if (cityMap[cityName]) {
        return cityMap[cityName];
    }

    // -si, -gun 등 접미사 제거 후 재시도
    if (cityName) {
        const cleanName = cityName.replace(/-si|-gun|-do/gi, '');
        if (cityMap[cleanName]) {
            return cityMap[cleanName];
        }
    }

    // 매핑되지 않은 경우 원래 이름 반환
    return cityName;
}

/**
 * 도시 이름을 시도 이름으로 변환
 * 에어코리아 API에서 사용할 시도명 추출
 */
function getCityToSido(cityName) {
    // 광역시/특별시 매핑
    const sidoMap = {
        'Seoul': '서울',
        'Busan': '부산',
        'Daegu': '대구',
        'Incheon': '인천',
        'Gwangju': '광주',
        'Daejeon': '대전',
        'Ulsan': '울산',
        'Sejong': '세종'
    };

    // 직접 매핑되는 경우
    if (sidoMap[cityName]) {
        return sidoMap[cityName];
    }

    // 경기도 지역 (예: Seongnam-si, Suwon-si 등)
    if (cityName && (cityName.includes('si') || cityName.includes('gun'))) {
        // Gyeonggi 관련 도시들
        const gyeonggiCities = ['Seongnam', 'Suwon', 'Goyang', 'Yongin', 'Bucheon', 'Ansan', 'Anyang',
                                'Namyangju', 'Hwaseong', 'Pyeongtaek', 'Uijeongbu', 'Siheung', 'Gimpo',
                                'Gwangmyeong', 'Gunpo', 'Hanam', 'Osan', 'Icheon', 'Yangju',
                                'Paju', 'Anseong', 'Guri', 'Pocheon', 'Uiwang', 'Yangpyeong', 'Yeoju',
                                'Dongducheon', 'Gwacheon', 'Gapyeong', 'Yeoncheon'];

        for (let city of gyeonggiCities) {
            if (cityName.includes(city)) {
                return '경기';
            }
        }
    }

    // 기본값: 서울
    return '서울';
}

/* ==========================================
   미세먼지 관련 함수 (현재 미사용)
   3일 날씨 예보 레이아웃에서는 미세먼지 정보를 표시하지 않음
   추후 필요시 재활성화 가능
   ========================================== */

// /**
//  * 미세먼지 데이터 가져오기
//  */
// async function fetchAirQualityData() {
//     console.log('미세먼지 데이터 가져오기...');
//
//     try {
//         // 도시 이름을 시도 이름으로 변환
//         const cityName = userLocation.city || 'Seoul';
//         const sidoName = getCityToSido(cityName);
//
//         console.log('도시 이름:', cityName, '-> 시도 이름:', sidoName);
//
//         // 시도별 실시간 평균 대기질 데이터 가져오기
//         const airQualityUrl = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?sidoName=${encodeURIComponent(sidoName)}&pageNo=1&numOfRows=10&returnType=json&serviceKey=${CONFIG.AIR_KOREA_API_KEY}&ver=1.0`;
//
//         console.log('대기질 조회 API 호출:', sidoName);
//
//         const airQualityResponse = await fetch(airQualityUrl);
//
//         // 응답 텍스트 먼저 확인
//         const responseText = await airQualityResponse.text();
//         console.log('API 응답 상태:', airQualityResponse.status);
//
//         if (!airQualityResponse.ok) {
//             throw new Error(`API 오류: ${airQualityResponse.status} - ${responseText}`);
//         }
//
//         const airQualityData = JSON.parse(responseText);
//         console.log('대기질 데이터:', airQualityData);
//
//         // 응답 확인
//         if (!airQualityData.response || !airQualityData.response.body || !airQualityData.response.body.items) {
//             throw new Error('대기질 정보를 가져올 수 없습니다');
//         }
//
//         // 첫 번째 측정소 데이터 사용
//         const airData = airQualityData.response.body.items[0];
//         const stationName = airData.stationName;
//
//         // PM10, PM2.5 값 파싱
//         const pm10Value = parseInt(airData.pm10Value) || 0;
//         const pm25Value = parseInt(airData.pm25Value) || 0;
//
//         console.log('PM10:', pm10Value, 'PM2.5:', pm25Value, '측정소:', stationName);
//
//         // 미세먼지 데이터 표시
//         displayAirQualityData({
//             pm10: {
//                 value: pm10Value,
//                 grade: getPM10Grade(pm10Value)
//             },
//             pm25: {
//                 value: pm25Value,
//                 grade: getPM25Grade(pm25Value)
//             },
//             station: stationName
//         });
//
//     } catch (error) {
//         console.error('미세먼지 데이터 가져오기 실패:', error);
//         console.error('에러 상세:', error.message);
//
//         // 에러 시 더미 데이터 표시
//         displayAirQualityData({
//             pm10: { value: '--', grade: 'unknown' },
//             pm25: { value: '--', grade: 'unknown' }
//         });
//     }
// }
//
// /**
//  * 미세먼지 데이터 표시
//  */
// function displayAirQualityData(data) {
//     const stationInfo = data.station ? `<div class="station-info">측정소: ${data.station}</div>` : '';
//
//     const airQualityHTML = `
//         ${stationInfo}
//         <div class="air-quality-item">
//             <div class="air-label">미세먼지 (PM10)</div>
//             <div class="air-value">
//                 <span class="air-number">${data.pm10.value}</span>
//                 <span class="air-grade ${getGradeClass(data.pm10.grade)}">
//                     ${getGradeText(data.pm10.grade)}
//                 </span>
//             </div>
//         </div>
//         <div class="air-quality-item">
//             <div class="air-label">초미세먼지 (PM2.5)</div>
//             <div class="air-value">
//                 <span class="air-number">${data.pm25.value}</span>
//                 <span class="air-grade ${getGradeClass(data.pm25.grade)}">
//                     ${getGradeText(data.pm25.grade)}
//                 </span>
//             </div>
//         </div>
//     `;
//
//     airQualityContent.innerHTML = airQualityHTML;
// }
//
// /**
//  * 미세먼지 등급 클래스 반환
//  */
// function getGradeClass(grade) {
//     const gradeMap = {
//         'good': 'grade-good',
//         'moderate': 'grade-moderate',
//         'unhealthy': 'grade-unhealthy',
//         'very-unhealthy': 'grade-very-unhealthy',
//         'unknown': ''
//     };
//
//     return gradeMap[grade] || '';
// }
//
// /**
//  * 미세먼지 등급 텍스트 반환
//  */
// function getGradeText(grade) {
//     const textMap = {
//         'good': '좋음',
//         'moderate': '보통',
//         'unhealthy': '나쁨',
//         'very-unhealthy': '매우 나쁨',
//         'unknown': 'API 키 필요'
//     };
//
//     return textMap[grade] || '정보 없음';
// }
//
// /**
//  * PM10 값을 기준으로 등급 계산
//  */
// function getPM10Grade(value) {
//     if (value <= 30) return 'good';
//     if (value <= 80) return 'moderate';
//     if (value <= 150) return 'unhealthy';
//     return 'very-unhealthy';
// }
//
// /**
//  * PM2.5 값을 기준으로 등급 계산
//  */
// function getPM25Grade(value) {
//     if (value <= 15) return 'good';
//     if (value <= 35) return 'moderate';
//     if (value <= 75) return 'unhealthy';
//     return 'very-unhealthy';
// }

/**
 * 마지막 업데이트 시간 표시
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    lastUpdateElement.textContent = `마지막 업데이트: ${timeString}`;
}

/**
 * 자동 업데이트 설정
 */
function setupAutoUpdate() {
    console.log('자동 업데이트 설정 (10분 간격)');

    // 기존 인터벌 제거
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    // 새 인터벌 설정
    updateInterval = setInterval(() => {
        console.log('자동 업데이트 실행');
        fetchAllData();
    }, AUTO_UPDATE_INTERVAL);
}

/**
 * 경고 메시지 표시
 */
function showWarning(message) {
    console.warn('Warning:', message);
    // 필요시 UI에 경고 메시지 표시
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
    console.error('Error:', message);

    const errorHTML = `
        <div class="error-message">
            ⚠️ ${message}
        </div>
    `;

    // 3개의 날씨 카드 영역에 에러 표시
    if (weatherToday) {
        weatherToday.innerHTML = errorHTML;
    }
    if (weatherTomorrow) {
        weatherTomorrow.innerHTML = errorHTML;
    }
    if (weatherDayAfter) {
        weatherDayAfter.innerHTML = errorHTML;
    }
}

// 페이지 언로드 시 인터벌 정리
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
