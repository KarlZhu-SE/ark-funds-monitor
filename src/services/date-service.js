export const dateService = {
    // calculate date string from n days before today
    getDateStrOfDateRange: (daysRange) => {
        const deadlineTimestamp = (new Date().setHours(0, 0, 0, 0) / 1000 - daysRange * 24 * 60 * 60) * 1000;
        return new Date(deadlineTimestamp).toISOString().split("T")[0];
    }
};