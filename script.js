class DoomsdayQuiz {
    constructor() {
        this.startYear = 1700;
        this.endYear = 2030;
        this.currentDate = null;
        this.startTime = null;
        this.questionCount = 0;
        this.correctCount = 0;
        this.currentStreak = 0;
        this.correctResponseTimes = []; // Only correct answers for timing stats
        this.lastQuestionData = null; // Store data for potential discard
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        // Quiz elements
        this.nextDateBtn = document.getElementById('nextDateBtn');
        this.discardBtn = document.getElementById('discardBtn');
        this.dateDisplay = document.getElementById('dateDisplay');
        this.answerButtons = document.getElementById('answerButtons');
        this.dayButtons = document.querySelectorAll('.day-btn');
        this.feedback = document.getElementById('feedback');
        this.questionCounter = document.getElementById('questionCounter');

        // Statistics elements
        this.totalQuestions = document.getElementById('totalQuestions');
        this.correctCountEl = document.getElementById('correctCount');
        this.accuracy = document.getElementById('accuracy');
        this.fastestTime = document.getElementById('fastestTime');
        this.slowestTime = document.getElementById('slowestTime');
        this.averageTime = document.getElementById('averageTime');
        this.currentStreakEl = document.getElementById('currentStreak');
        this.resetStatsBtn = document.getElementById('resetStatsBtn');

        // Settings elements
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.startYearInput = document.getElementById('startYear');
        this.endYearInput = document.getElementById('endYear');
        this.applySettingsBtn = document.getElementById('applySettings');
        this.resetSettingsBtn = document.getElementById('resetSettings');
        this.cancelSettingsBtn = document.getElementById('cancelSettings');

        // Hint elements
        this.monthHintBtn = document.getElementById('monthHintBtn');
        this.monthHintDropdown = document.getElementById('monthHintDropdown');
        this.yearHintBtn = document.getElementById('yearHintBtn');
        this.yearHintDropdown = document.getElementById('yearHintDropdown');

        // Mobile elements
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.mobileSidebar = document.getElementById('mobileSidebar');
        this.closeSidebarBtn = document.getElementById('closeSidebarBtn');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.mobileSettingsBtn = document.getElementById('mobileSettingsBtn');

        // Mobile hint elements
        this.mobileMonthHintBtn = document.getElementById('mobileMonthHintBtn');
        this.mobileMonthHintDropdown = document.getElementById('mobileMonthHintDropdown');
        this.mobileYearHintBtn = document.getElementById('mobileYearHintBtn');
        this.mobileYearHintDropdown = document.getElementById('mobileYearHintDropdown');

        // Mobile stats elements
        this.mobileTotal = document.getElementById('mobileTotal');
        this.mobileCorrect = document.getElementById('mobileCorrect');
        this.mobileAccuracy = document.getElementById('mobileAccuracy');
        this.mobileFastest = document.getElementById('mobileFastest');
        this.mobileSlowest = document.getElementById('mobileSlowest');
        this.mobileAverage = document.getElementById('mobileAverage');
        this.mobileStreak = document.getElementById('mobileStreak');
        this.mobileResetStatsBtn = document.getElementById('mobileResetStatsBtn');
    }

    setupEventListeners() {
        // Quiz listeners
        this.nextDateBtn.addEventListener('click', () => this.startNewQuestion());
        this.discardBtn.addEventListener('click', () => this.discardQuestion());
        this.dayButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e.target.dataset.day));
        });

        // Statistics listeners
        this.resetStatsBtn.addEventListener('click', () => this.confirmResetStats());
        this.mobileResetStatsBtn.addEventListener('click', () => this.confirmResetStats());

        // Settings listeners
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.applySettingsBtn.addEventListener('click', () => this.applySettings());
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.closeSettings());

        // Modal close on background click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Hint listeners
        this.monthHintBtn.addEventListener('click', () => this.toggleHint('month'));
        this.yearHintBtn.addEventListener('click', () => this.toggleHint('year'));

        // Mobile hint listeners
        this.mobileMonthHintBtn.addEventListener('click', () => this.toggleMobileHint('month'));
        this.mobileYearHintBtn.addEventListener('click', () => this.toggleMobileHint('year'));

        // Mobile sidebar listeners
        this.mobileMenuBtn.addEventListener('click', () => this.openSidebar());
        this.closeSidebarBtn.addEventListener('click', () => this.closeSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        this.mobileSettingsBtn.addEventListener('click', () => {
            this.closeSidebar();
            this.openSettings();
        });

        // Close hints when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.hint-section')) {
                this.closeAllHints();
                this.closeAllMobileHints();
            }
        });
    }

    // Date calculation using date-fns library
    getDayOfWeek(year, month, day) {
        try {
            // Create a date object (month is 0-indexed in JavaScript Date)
            const date = new Date(year, month - 1, day);
            
            // Validate the date was created correctly
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                console.warn('Date validation failed, using fallback');
                return this.fallbackGetDayOfWeek(year, month, day);
            }
            
            // Use date-fns to format the day name directly
            const dayName = dateFns.format(date, 'EEEE');
            return dayName;
        } catch (error) {
            console.error('Error calculating day of week:', error);
            // Fallback to manual calculation if library fails
            return this.fallbackGetDayOfWeek(year, month, day);
        }
    }

    // Fallback method using JavaScript's built-in Date object
    fallbackGetDayOfWeek(year, month, day) {
        try {
            // Use JavaScript's built-in Date object as fallback
            const date = new Date(year, month - 1, day);
            
            // Validate the date was created correctly
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                console.error('Invalid date in fallback method');
                return 'Unknown';
            }
            
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[date.getDay()];
        } catch (error) {
            console.error('Error in fallback method:', error);
            return 'Unknown';
        }
    }

    generateRandomDate() {
        const year = Math.floor(Math.random() * (this.endYear - this.startYear + 1)) + this.startYear;
        const month = Math.floor(Math.random() * 12) + 1;
        
        // Get days in month
        const daysInMonth = new Date(year, month, 0).getDate();
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        
        return { year, month, day };
    }

    formatDate(date) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return `${months[date.month - 1]} ${date.day}, ${date.year}`;
    }

    formatTime(milliseconds) {
        const seconds = milliseconds / 1000;
        
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, '0')}`;
        }
    }

    generateExplanation(year, month, day, correctDay) {
        // Month adjustments table
        const monthAdjustments = {
            1: { name: 'January', value: 4 },
            2: { name: 'February', value: 0 },
            3: { name: 'March', value: 0 },
            4: { name: 'April', value: 3 },
            5: { name: 'May', value: 5 },
            6: { name: 'June', value: 1 },
            7: { name: 'July', value: 3 },
            8: { name: 'August', value: 6 },
            9: { name: 'September', value: 2 },
            10: { name: 'October', value: 4 },
            11: { name: 'November', value: 0 },
            12: { name: 'December', value: 2 }
        };

        // Doomsdays for 2003-2010 with numerical values
        const knownDoomsdays = {
            2003: { name: 'Friday', value: 5 },
            2004: { name: 'Sunday', value: 0 },
            2005: { name: 'Monday', value: 1 },
            2006: { name: 'Tuesday', value: 2 },
            2007: { name: 'Wednesday', value: 3 },
            2008: { name: 'Friday', value: 5 },
            2009: { name: 'Saturday', value: 6 },
            2010: { name: 'Sunday', value: 0 }
        };

        const monthInfo = monthAdjustments[month];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        let explanation = `<div class="explanation">`;
        explanation += `<h4>How to solve:</h4>`;
        
        if (knownDoomsdays[year]) {
            // For 2003-2010, use the special format
            const doomsdayInfo = knownDoomsdays[year];
            const dayMod7 = day % 7;
            
            // Check for leap year adjustment
            const isLeapYear = this.isLeapYear(year);
            const needsLeapAdjustment = isLeapYear && (month === 1 || month === 2);
            const leapAdjustment = needsLeapAdjustment ? -1 : 0;
            
            const total = monthInfo.value + dayMod7 + doomsdayInfo.value + leapAdjustment;
            const finalDay = total % 7;
            const finalDayName = dayNames[finalDay];
            
            explanation += `<div class="step"><strong>Step 1:</strong> ${monthInfo.name} adjustment = ${monthInfo.value}</div>`;
            
            // Only show mod 7 for days >= 7 or when day is exactly 7
            if (day >= 7) {
                if (day === 7) {
                    explanation += `<div class="step"><strong>Step 2:</strong> Day adjustment +${day} (${day}%7 = 0)</div>`;
                } else {
                    explanation += `<div class="step"><strong>Step 2:</strong> Day adjustment +${day} (or ${dayMod7} after % 7)</div>`;
                }
            } else {
                explanation += `<div class="step"><strong>Step 2:</strong> Day adjustment +${day}</div>`;
            }
            
            explanation += `<div class="step"><strong>Step 3:</strong> ${year} doomsday = +${doomsdayInfo.value} (${doomsdayInfo.name})</div>`;
            
            if (needsLeapAdjustment) {
                explanation += `<div class="step"><strong>Step 3.5:</strong> Leap year adjustment = -1 (${year} is a leap year and month is Jan/Feb)</div>`;
                explanation += `<div class="step"><strong>Step 4:</strong> ${monthInfo.value} + ${dayMod7} + ${doomsdayInfo.value} - 1 = ${total}</div>`;
            } else {
                explanation += `<div class="step"><strong>Step 4:</strong> ${monthInfo.value} + ${dayMod7} + ${doomsdayInfo.value} = ${total}</div>`;
            }
            
            explanation += `<div class="step">% 7 = ${finalDay}</div>`;
            explanation += `<div class="step"><strong>Final answer:</strong> ${finalDayName} (${finalDay})</div>`;
        } else {
            // For other years, add century and year adjustments
            const yearCalc = this.calculateYearDoomsday(year);
            const centuryAdj = this.getCenturyAdjustment(year);
            const yearAdj = yearCalc.yearValue;
            
            // Check for leap year adjustment
            const isLeapYear = this.isLeapYear(year);
            const needsLeapAdjustment = isLeapYear && (month === 1 || month === 2);
            const leapAdjustment = needsLeapAdjustment ? -1 : 0;
            
            const total = monthInfo.value + day + centuryAdj + yearAdj + leapAdjustment;
            const finalDay = total % 7;
            const finalDayName = dayNames[finalDay];
            
            explanation += `<div class="step"><strong>Year calculation:</strong><br>${yearCalc.explanation}</div>`;
            
            if (needsLeapAdjustment) {
                explanation += `<div class="step"><strong>Calculation:</strong><br>${monthInfo.value} (${monthInfo.name}) + ${day} (day) + ${centuryAdj} (century) + ${yearAdj} (year) - 1 (leap year Jan/Feb) = ${total}<br>${total} mod 7 = ${finalDay} = ${finalDayName}</div>`;
            } else {
                explanation += `<div class="step"><strong>Calculation:</strong><br>${monthInfo.value} (${monthInfo.name}) + ${day} (day) + ${centuryAdj} (century) + ${yearAdj} (year) = ${total}<br>${total} mod 7 = ${finalDay} = ${finalDayName}</div>`;
            }
        }
        
        explanation += `</div>`;
        
        return explanation;
    }

    calculateYearDoomsday(year) {
        // Odd +11 method for years outside 2003-2010
        let workingYear = year % 100;
        let steps = [`Take last 2 digits: ${workingYear}`];
        
        if (workingYear % 2 === 1) {
            workingYear += 11;
            steps.push(`Odd, so add 11: ${workingYear}`);
        } else {
            steps.push(`Even, so no change: ${workingYear}`);
        }
        
        workingYear = Math.floor(workingYear / 2);
        steps.push(`Divide by 2: ${workingYear}`);
        
        if (workingYear % 2 === 1) {
            workingYear += 11;
            steps.push(`Odd, so add 11: ${workingYear}`);
        } else {
            steps.push(`Even, so no change: ${workingYear}`);
        }
        
        const yearValue = workingYear % 7;
        steps.push(`Mod 7: ${yearValue}`);
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        return {
            doomsday: days[yearValue],
            yearValue: yearValue,
            explanation: steps.join('<br>')
        };
    }

    getCenturyAdjustment(year) {
        const century = Math.floor(year / 100);
        if (century === 17) return 4;
        else if (century === 18) return 2;
        else if (century === 19) return 0;
        else if (century === 20) return 6;
        else if (century === 21) return 4;
        else return 0; // Default for other centuries
    }

    isLeapYear(year) {
        // A year is a leap year if:
        // 1. It's divisible by 4, AND
        // 2. If it's divisible by 100, it must also be divisible by 400
        return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0);
    }

    startNewQuestion() {
        this.currentDate = this.generateRandomDate();
        this.questionCount++;
        
        // Update UI
        this.questionCounter.textContent = `Question: ${this.questionCount}`;
        this.dateDisplay.textContent = this.formatDate(this.currentDate);
        this.answerButtons.style.display = 'block';
        this.nextDateBtn.disabled = true;
        this.discardBtn.style.display = 'none';
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
        
        // Enable answer buttons
        this.dayButtons.forEach(btn => btn.disabled = false);
        
        // Start timer
        this.startTime = performance.now();
    }

    handleAnswer(selectedDay) {
        const endTime = performance.now();
        const responseTime = endTime - this.startTime;
        
        // Disable answer buttons
        this.dayButtons.forEach(btn => btn.disabled = true);
        
        // Calculate correct answer
        const correctDay = this.getDayOfWeek(this.currentDate.year, this.currentDate.month, this.currentDate.day);
        const isCorrect = selectedDay === correctDay;
        
        // Store data for potential discard
        this.lastQuestionData = {
            responseTime: responseTime,
            isCorrect: isCorrect,
            wasCorrectBefore: this.correctCount,
            wasStreakBefore: this.currentStreak,
            wasCorrectTimesBefore: [...this.correctResponseTimes]
        };
        
        // Update statistics
        if (isCorrect) {
            this.correctResponseTimes.push(responseTime);
        }
        
        const formattedTime = this.formatTime(responseTime);
        const explanation = this.generateExplanation(this.currentDate.year, this.currentDate.month, this.currentDate.day, correctDay);
        
        if (isCorrect) {
            this.correctCount++;
            this.currentStreak++;
            // For correct answers, show collapsible explanation
            this.feedback.innerHTML = `
                <div class="result">${selectedDay} is Correct! (${formattedTime})</div>
                <button class="show-explanation-btn" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'; this.textContent = this.textContent === 'Show Explanation' ? 'Hide Explanation' : 'Show Explanation';">Show Explanation</button>
                <div class="collapsible-explanation" style="display: none;">${explanation}</div>
            `;
            this.feedback.className = 'feedback correct';
        } else {
            this.currentStreak = 0;
            // For incorrect answers, always show explanation
            this.feedback.innerHTML = `<div class="result">${selectedDay} is Incorrect. The answer was ${correctDay}. (${formattedTime})</div>${explanation}`;
            this.feedback.className = 'feedback incorrect';
        }
        
        // Update statistics display
        this.updateStatistics();
        
        // Show discard button and hide next date button temporarily
        this.discardBtn.style.display = 'inline-block';
        this.nextDateBtn.disabled = false;
        this.answerButtons.style.display = 'none';
    }

    discardQuestion() {
        if (!this.lastQuestionData) return;
        
        // Revert correct response times to previous state
        this.correctResponseTimes = this.lastQuestionData.wasCorrectTimesBefore;
        
        // Revert correct count and streak
        this.correctCount = this.lastQuestionData.wasCorrectBefore;
        this.currentStreak = this.lastQuestionData.wasStreakBefore;
        
        // Decrease question count
        this.questionCount--;
        
        // Update statistics display
        this.updateStatistics();
        
        // Update question counter
        this.questionCounter.textContent = `Question: ${this.questionCount}`;
        
        // Hide discard button and show feedback that question was discarded
        this.discardBtn.style.display = 'none';
        this.feedback.innerHTML = '<div class="result" style="color: #f39c12;">Question discarded from statistics</div>';
        this.feedback.className = 'feedback';
        
        // Clear last question data
        this.lastQuestionData = null;
        
        // Save updated session
        this.saveSession();
    }

    updateStatistics() {
        const accuracy = this.questionCount > 0 ? ((this.correctCount / this.questionCount) * 100).toFixed(1) + '%' : '0%';
        
        // Update desktop stats
        this.totalQuestions.textContent = this.questionCount;
        this.correctCountEl.textContent = this.correctCount;
        this.accuracy.textContent = accuracy;
        this.currentStreakEl.textContent = this.currentStreak;
        
        // Update mobile stats
        this.mobileTotal.textContent = this.questionCount;
        this.mobileCorrect.textContent = this.correctCount;
        this.mobileAccuracy.textContent = accuracy;
        this.mobileStreak.textContent = this.currentStreak;
        
        if (this.correctResponseTimes.length > 0) {
            const fastest = Math.min(...this.correctResponseTimes);
            const slowest = Math.max(...this.correctResponseTimes);
            const average = this.correctResponseTimes.reduce((a, b) => a + b, 0) / this.correctResponseTimes.length;
            
            const fastestFormatted = this.formatTime(fastest);
            const slowestFormatted = this.formatTime(slowest);
            const averageFormatted = this.formatTime(average);
            
            // Update desktop stats
            this.fastestTime.textContent = fastestFormatted;
            this.slowestTime.textContent = slowestFormatted;
            this.averageTime.textContent = averageFormatted;
            
            // Update mobile stats
            this.mobileFastest.textContent = fastestFormatted;
            this.mobileSlowest.textContent = slowestFormatted;
            this.mobileAverage.textContent = averageFormatted;
        } else {
            // No correct answers yet
            this.fastestTime.textContent = '-';
            this.slowestTime.textContent = '-';
            this.averageTime.textContent = '-';
            this.mobileFastest.textContent = '-';
            this.mobileSlowest.textContent = '-';
            this.mobileAverage.textContent = '-';
        }
        
        // Save to session storage
        this.saveSession();
    }

    saveSession() {
        const sessionData = {
            questionCount: this.questionCount,
            correctCount: this.correctCount,
            currentStreak: this.currentStreak,
            correctResponseTimes: this.correctResponseTimes,
            startYear: this.startYear,
            endYear: this.endYear
        };
        
        sessionStorage.setItem('doomsdayQuizSession', JSON.stringify(sessionData));
    }

    loadSession() {
        const sessionData = sessionStorage.getItem('doomsdayQuizSession');
        
        if (sessionData) {
            const data = JSON.parse(sessionData);
            this.questionCount = data.questionCount || 0;
            this.correctCount = data.correctCount || 0;
            this.currentStreak = data.currentStreak || 0;
            this.correctResponseTimes = data.correctResponseTimes || [];
            
            this.updateStatistics();
        }
    }

    resetSession() {
        this.questionCount = 0;
        this.correctCount = 0;
        this.currentStreak = 0;
        this.responseTimes = [];
        
        this.updateStatistics();
        sessionStorage.removeItem('doomsdayQuizSession');
        
        // Reset UI
        this.dateDisplay.textContent = 'Click "Next Date" to start!';
        this.answerButtons.style.display = 'none';
        this.nextDateBtn.disabled = false;
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
        this.questionCounter.textContent = 'Question: 0';
    }

    // Settings functionality
    openSettings() {
        this.startYearInput.value = this.startYear;
        this.endYearInput.value = this.endYear;
        this.settingsModal.style.display = 'block';
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }

    applySettings() {
        const newStartYear = parseInt(this.startYearInput.value);
        const newEndYear = parseInt(this.endYearInput.value);
        
        if (newStartYear >= newEndYear) {
            alert('Start year must be before end year!');
            return;
        }
        
        if (newStartYear < 1 || newEndYear > 9999) {
            alert('Please enter valid years between 1 and 9999!');
            return;
        }
        
        this.startYear = newStartYear;
        this.endYear = newEndYear;
        
        this.saveSettings();
        this.resetSession();
        this.closeSettings();
    }

    resetSettings() {
        this.startYear = 1700;
        this.endYear = 2030;
        this.startYearInput.value = this.startYear;
        this.endYearInput.value = this.endYear;
    }

    saveSettings() {
        const settings = {
            startYear: this.startYear,
            endYear: this.endYear
        };
        
        sessionStorage.setItem('doomsdayQuizSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const settings = sessionStorage.getItem('doomsdayQuizSettings');
        
        if (settings) {
            const data = JSON.parse(settings);
            this.startYear = data.startYear || 1700;
            this.endYear = data.endYear || 2030;
        }
        
        // Load session after settings
        this.loadSession();
    }

    // Hint functionality
    toggleHint(type) {
        if (type === 'month') {
            const isVisible = this.monthHintDropdown.classList.contains('show');
            this.closeAllHints();
            if (!isVisible) {
                this.monthHintDropdown.classList.add('show');
            }
        } else if (type === 'year') {
            const isVisible = this.yearHintDropdown.classList.contains('show');
            this.closeAllHints();
            if (!isVisible) {
                this.yearHintDropdown.classList.add('show');
            }
        }
    }

    closeAllHints() {
        this.monthHintDropdown.classList.remove('show');
        this.yearHintDropdown.classList.remove('show');
    }

    // Mobile functionality
    openSidebar() {
        this.mobileSidebar.classList.add('open');
        this.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.mobileSidebar.classList.remove('open');
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleMobileHint(type) {
        if (type === 'month') {
            const isVisible = this.mobileMonthHintDropdown.classList.contains('show');
            this.closeAllMobileHints();
            if (!isVisible) {
                this.mobileMonthHintDropdown.classList.add('show');
            }
        } else if (type === 'year') {
            const isVisible = this.mobileYearHintDropdown.classList.contains('show');
            this.closeAllMobileHints();
            if (!isVisible) {
                this.mobileYearHintDropdown.classList.add('show');
            }
        }
    }

    closeAllMobileHints() {
        this.mobileMonthHintDropdown.classList.remove('show');
        this.mobileYearHintDropdown.classList.remove('show');
    }

    // Statistics reset functionality
    confirmResetStats() {
        if (confirm('Are you sure you want to reset all session statistics? This action cannot be undone.')) {
            this.resetSessionStats();
        }
    }

    resetSessionStats() {
        // Reset all statistics
        this.questionCount = 0;
        this.correctCount = 0;
        this.currentStreak = 0;
        this.correctResponseTimes = [];
        this.lastQuestionData = null;

        // Update all displays
        this.updateStatistics();
        
        // Reset question counter
        this.questionCounter.textContent = 'Question: 0';
        
        // Reset UI to initial state
        this.dateDisplay.textContent = 'Click "Next Date" to start!';
        this.answerButtons.style.display = 'none';
        this.nextDateBtn.disabled = false;
        this.discardBtn.style.display = 'none';
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
        
        // Clear session storage
        sessionStorage.removeItem('doomsdayQuizSession');
        
        // Show confirmation
        this.feedback.innerHTML = '<div class="result" style="color: #27ae60;">Statistics reset successfully!</div>';
        this.feedback.className = 'feedback';
        
        // Clear confirmation message after 3 seconds
        setTimeout(() => {
            this.feedback.textContent = '';
            this.feedback.className = 'feedback';
        }, 3000);
    }
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DoomsdayQuiz();
});
