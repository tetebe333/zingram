export function formatLastSeen(date: Date | null): string {
    if (!date) return 'Offline';

    const now = new Date();

    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 1 minute
    if (diff < 60) {
        return 'Last seen just now';
    }

    // Minutes
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);

        return `Last seen ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    // Hours (same day)
    const isToday =
        now.toDateString() === date.toDateString();

    if (isToday) {
        return `Last seen today at ${date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        })}`;
    }

    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (yesterday.toDateString() === date.toDateString()) {
        return `Last seen yesterday at ${date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        })}`;
    }

    // Older
    return `Last seen ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    })}`;
}