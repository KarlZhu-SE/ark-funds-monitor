export const dateService = {
    // calculate date string from n days before today
    getDateStrOfDateRange: (daysRange) => {
        const deadlineTimestamp = (new Date().setHours(0, 0, 0, 0) / 1000 - daysRange * 24 * 60 * 60) * 1000;
        return new Date(deadlineTimestamp).toISOString().split("T")[0];
    },

    getDateStrFromDate: (date) =>
        new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .split("T")[0],

    timeSince: (date) => {
        var seconds = Math.floor(((new Date().getTime()/1000) - date));
        var intervalType;

        var interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
          intervalType = 'year';
        } else {
          interval = Math.floor(seconds / 2592000);
          if (interval >= 1) {
            intervalType = 'month';
          } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
              intervalType = 'day';
            } else {
              interval = Math.floor(seconds / 3600);
              if (interval >= 1) {
                intervalType = "hour";
              } else {
                interval = Math.floor(seconds / 60);
                if (interval >= 1) {
                  intervalType = "minute";
                } else {
                  interval = seconds;
                  intervalType = "second";
                }
              }
            }
          }
        }
      
        if (interval > 1 || interval === 0) {
          intervalType += 's';
        }
      
        return `${interval} ${intervalType} ago`;
    }
};