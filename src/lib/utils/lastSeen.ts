import { Timestamp } from "firebase/firestore";

export function formatLastSeen(date: Date | null): string {
    if (!date) return 'Offline';

    const now = new Date();

    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 1 minute
    if (diff < 60) {
        return 'just now';
    }

    // Minutes
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);

        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    // Hours (same day)
    const isToday =
        now.toDateString() === date.toDateString();

    if (isToday) {
        return `today at ${date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        })}`;
    }

    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (yesterday.toDateString() === date.toDateString()) {
        return `yesterday at ${date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        })}`;
    }

    // Older
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    })}`;
}

export function formatLastTime(
    lastMessageTime: Timestamp | Date | null | undefined
): string {
    if (!lastMessageTime) {
        return '';
    }

    const date =
        lastMessageTime instanceof Timestamp
            ? lastMessageTime.toDate()
            : lastMessageTime;

    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString('en-NG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
        return `Yesterday, ${date.toLocaleTimeString('en-NG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })}`;
    }

    return date.toLocaleDateString('en-NG', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}