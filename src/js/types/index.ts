export interface Task {
    id: string;
    title: string;
    estPomodoros: number;
    actualPomodoros: number;
    isCompleted: boolean;
    isActive: boolean;
}

export interface Settings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    alarmSound: 'bell' | 'bird' | 'digital';
    tickingSound: 'none' | 'tick' | 'rain';
    volume: number;
    darkMode: boolean;
}

export interface FocusHistoryDay {
    seconds: number;
    pomodoros: number;
}

export interface FocusHistory {
    [date: string]: FocusHistoryDay;
}

export interface State {
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    timeRemaining: number;
    isRunning: boolean;
    timerId: any | null; // Can be number or NodeJS.Timeout, using any for cross-compatibility
    pomodorosCompleted: number;
    tasks: Task[];
    activeTaskId: string | null;
    settings: Settings;
    focusHistory: FocusHistory;
}
