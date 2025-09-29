# Product Requirements Document: Doomsday Practice Quiz

## 1. Product Overview

### 1.1 Purpose
A web-based quiz application that helps users practice determining the day of the week for historical dates. This tool is designed to help users improve their mental calculation skills for date-to-day conversions, particularly useful for learning the Doomsday algorithm or similar date calculation methods.

### 1.2 Target Users
- Students learning date calculation algorithms
- Mental math enthusiasts
- Anyone interested in improving their calendar calculation skills

## 2. Functional Requirements

### 2.1 Core Quiz Functionality

#### 2.1.1 Quiz Interface
- **Date Display**: Present a random historical date in a clear, readable format (e.g., "March 15, 1847")
- **Answer Options**: Provide seven clickable buttons for days of the week (Monday through Sunday)
- **Timer**: Start timing automatically when the date is displayed
- **Response Capture**: Record the exact time when user selects an answer
- **Feedback**: Immediately show whether the answer was correct or incorrect
- **Next Question**: Manual progression via "Next Date" button after feedback display

#### 2.1.2 Timing System
- **Precision**: Measure response time in milliseconds
- **Start Trigger**: Begin timing when "Next Date" button is clicked and date appears
- **End Trigger**: Stop timing when user clicks an answer button
- **Display**: Show response time after each question

### 2.2 Session Statistics

#### 2.2.1 Real-time Stats Display
- **Current Session Stats**:
  - Number of questions answered
  - Correct/incorrect count
  - Accuracy percentage
  - Fastest time
  - Slowest time
  - Average time
  - Current streak (consecutive correct answers)

#### 2.2.2 Statistics Panel
- **Location**: Persistent sidebar or toggle-able panel
- **Updates**: Real-time updates after each question
- **Visual Elements**: Progress indicators and clear numerical displays

### 2.3 Settings Configuration

#### 2.3.1 Date Range Settings
- **Start Date**: User-selectable minimum date for quiz questions
- **End Date**: User-selectable maximum date for quiz questions
- **Default Range**: 1700-2030
- **Validation**: Ensure start date is before end date
- **Persistence**: Save settings for the current session


## 3. Technical Requirements

### 3.1 Platform
- **Technology Stack**: HTML5, CSS3, Vanilla JavaScript
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive Design**: Mobile-friendly interface

### 3.2 Performance
- **Response Time**: < 100ms for question generation
- **Timing Accuracy**: Millisecond precision for user response timing
- **Memory Usage**: Efficient session data management

### 3.3 Data Storage
- **Session Storage**: Use browser's sessionStorage for temporary data
- **No Backend Required**: Fully client-side application
- **Data Persistence**: Statistics persist only for current browser session

## 4. User Interface Requirements

### 4.1 Layout Structure
```
+------------------------------------------+
|              Header/Title                |
+------------------------------------------+
| Settings |              | Statistics     |
| Button   |    Quiz      | Panel         |
|          |    Area      | (toggleable)  |
|          |              |               |
|          |              |               |
+------------------------------------------+
```

### 4.2 Quiz Area
- **Date Display**: Large, prominent text showing the historical date
- **Answer Buttons**: Seven equally-sized buttons arranged horizontally or in a grid
- **Next Date Button**: Prominent button to generate next question and start timer
- **Feedback Area**: Space for showing correct/incorrect feedback and timing
- **Question Counter**: Display current question number

### 4.3 Statistics Panel
- **Compact Display**: Efficiently show all statistics without clutter
- **Clear Labels**: Easy-to-read labels for each statistic
- **Visual Hierarchy**: Most important stats (accuracy, average time) prominently displayed

### 4.4 Settings Modal/Page
- **Date Range Selectors**: Intuitive date input fields or date pickers
- **Apply Button**: Clear action to apply new settings
- **Reset Option**: Ability to reset to default settings
- **Cancel Option**: Close without applying changes

## 5. User Experience Flow

### 5.1 Initial Load
1. User visits the website
2. Default settings are loaded
3. "Next Date" button is displayed, ready for first question
4. Statistics panel shows initial state (all zeros)

### 5.2 Quiz Flow
1. User clicks "Next Date" button
2. Historical date appears on screen (timer starts)
3. User reads the date and calculates day of week
4. User clicks on one of the seven day buttons (timer stops)
5. Immediate feedback shows correct answer and response time
6. Statistics update automatically
7. "Next Date" button becomes available for next question

### 5.3 Settings Flow
1. User clicks settings button/icon
2. Settings modal/page opens
3. User adjusts date range
4. User applies settings
5. New questions use updated date range
6. Statistics reset for new session parameters

## 6. Success Metrics

### 6.1 User Engagement
- Session duration (time spent practicing)
- Number of questions answered per session
- Return usage patterns

### 6.2 Learning Effectiveness
- Improvement in response times over session
- Improvement in accuracy over session
- Consistency of performance

## 7. Technical Implementation Notes

### 7.1 Date Calculation
- Implement accurate day-of-week calculation algorithm
- Account for calendar changes (Gregorian/Julian transition)
- Validate historical date accuracy

### 7.2 Random Date Generation
- Uniform distribution within specified range
- Avoid repetition within short time periods
- Ensure generated dates are valid

### 7.3 Timer Implementation
- Use `performance.now()` for high-precision timing
- Handle edge cases (page focus/blur)
- Ensure consistent timing across different devices

## 8. Future Enhancements

### 8.1 Phase 2 Features
- Local storage for persistent statistics across sessions
- Multiple difficulty levels
- Historical context for dates (events that happened)

### 8.2 Phase 3 Features
- User accounts and progress tracking
- Leaderboards and social features
- Educational content about date calculation methods

## 9. Constraints and Assumptions

### 9.1 Constraints
- No backend server required
- Must work offline after initial load
- Single-page application

### 9.2 Assumptions
- Users have basic understanding of days of the week
- Users are motivated to improve their skills
- Modern browser environment with JavaScript enabled

---

## Acceptance Criteria Summary

**Must Have (MVP)**:
- ✅ Quiz interface with historical date display
- ✅ Seven day-of-week answer buttons
- ✅ Millisecond-precision timing
- ✅ Session statistics (high, low, average times)
- ✅ Settings page for date range configuration
- ✅ Immediate feedback on answers

**Should Have**:
- ✅ Responsive design
- ✅ Accuracy tracking
- ✅ Visual statistics display

**Could Have**:
- Historical context for dates
- Keyboard shortcuts
- Sound effects for feedback

This PRD provides a solid foundation for developing your Doomsday Practice Quiz application.
