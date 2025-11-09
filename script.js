const prayerNames = {
    Fajr: 'Fajr',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha'
};

function initApp() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchPrayerTimesByCoordinates(latitude, longitude);
            },
            error => {
                console.error('Geolocation error:', error);
                showCityInput();
            }
        );
    } else {
        showCityInput();
    }

    document.getElementById('citySubmit').addEventListener('click', handleCitySubmit);
    document.getElementById('cityInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleCitySubmit();
        }
    });
}

function showCityInput() {
    document.getElementById('locationText').textContent = '📍 Location access denied';
    document.getElementById('cityInputSection').style.display = 'block';
}

function handleCitySubmit() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        fetchPrayerTimesByCity(city);
    } else {
        alert('Please enter a city name');
    }
}

async function fetchPrayerTimesByCoordinates(latitude, longitude) {
    try {
        const response = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        const data = await response.json();
        
        if (data.code === 200) {
            displayPrayerTimes(data.data);
            updateLocationText('Your Location');
        } else {
            throw new Error('Failed to fetch prayer times');
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        showCityInput();
        alert('Failed to fetch prayer times. Please enter your city name.');
    }
}

async function fetchPrayerTimesByCity(city) {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('prayerTimes').innerHTML = '<div class="loading" id="loading"><div class="spinner"></div><p>Loading prayer times...</p></div>';
        
        const response = await fetch(
            `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(city)}&method=2`
        );
        const data = await response.json();
        
        if (data.code === 200) {
            displayPrayerTimes(data.data);
            updateLocationText(city);
            document.getElementById('cityInputSection').style.display = 'none';
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        alert('Could not find prayer times for this city. Please check the spelling and try again.');
        document.getElementById('loading').style.display = 'none';
    }
}

function displayPrayerTimes(data) {
    const timings = data.timings;
    const prayerTimesContainer = document.getElementById('prayerTimes');
    
    prayerTimesContainer.innerHTML = '';
    
    Object.keys(prayerNames).forEach(prayer => {
        const prayerCard = document.createElement('div');
        prayerCard.className = 'prayer-card';
        
        const prayerName = document.createElement('div');
        prayerName.className = 'prayer-name';
        prayerName.textContent = prayerNames[prayer];
        
        const prayerTime = document.createElement('div');
        prayerTime.className = 'prayer-time';
        prayerTime.textContent = timings[prayer];
        
        prayerCard.appendChild(prayerName);
        prayerCard.appendChild(prayerTime);
        prayerTimesContainer.appendChild(prayerCard);
    });
    
    updateDates(data.date);
}

function updateDates(dateInfo) {
    const gregorianDate = document.getElementById('gregorianDate');
    const hijriDate = document.getElementById('hijriDate');
    
    const gDate = dateInfo.gregorian;
    const hDate = dateInfo.hijri;
    
    gregorianDate.textContent = `${gDate.weekday.en}, ${gDate.day} ${gDate.month.en} ${gDate.year}`;
    hijriDate.textContent = `${hDate.day} ${hDate.month.en} ${hDate.year} AH`;
}

function updateLocationText(location) {
    document.getElementById('locationText').textContent = `📍 ${location}`;
}

document.addEventListener('DOMContentLoaded', initApp);
