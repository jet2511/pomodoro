import { state } from './state';
import { elements } from './elements';

export function updateStatsUI(): void {
    const today = new Date().toLocaleDateString('en-CA');
    const todayData = state.focusHistory[today] || { seconds: 0, pomodoros: 0 };

    // Calculate total pomodoros across all history
    const totalPomodoros = Object.values(state.focusHistory).reduce((acc, curr) => acc + curr.pomodoros, 0);

    // Format today's time
    const hours = Math.floor(todayData.seconds / 3600);
    const minutes = Math.floor((todayData.seconds % 3600) / 60);

    elements.statTotalPomodoros.textContent = String(totalPomodoros);
    elements.statTodayTime.textContent = `${hours}h ${minutes}m`;
}
