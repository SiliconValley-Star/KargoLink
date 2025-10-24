"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateHelpers = void 0;
exports.DateHelpers = {
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    addHours: (date, hours) => {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    },
    addMinutes: (date, minutes) => {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    },
    startOfDay: (date) => {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    },
    endOfDay: (date) => {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    },
    startOfMonth: (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    },
    endOfMonth: (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    },
    isWeekend: (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    },
    isBusinessDay: (date) => {
        return !exports.DateHelpers.isWeekend(date);
    },
    getNextBusinessDay: (date) => {
        let nextDay = exports.DateHelpers.addDays(date, 1);
        while (exports.DateHelpers.isWeekend(nextDay)) {
            nextDay = exports.DateHelpers.addDays(nextDay, 1);
        }
        return nextDay;
    },
    getBusinessDaysBetween: (startDate, endDate) => {
        let count = 0;
        const current = new Date(startDate);
        while (current <= endDate) {
            if (exports.DateHelpers.isBusinessDay(current)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    },
    getTurkishHolidays: (year) => {
        return [
            new Date(year, 0, 1),
            new Date(year, 3, 23),
            new Date(year, 4, 1),
            new Date(year, 4, 19),
            new Date(year, 6, 15),
            new Date(year, 7, 30),
            new Date(year, 9, 29),
        ];
    },
    isTurkishHoliday: (date) => {
        const holidays = exports.DateHelpers.getTurkishHolidays(date.getFullYear());
        return holidays.some(holiday => holiday.getDate() === date.getDate() &&
            holiday.getMonth() === date.getMonth());
    },
    calculateAge: (birthDate) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    },
    formatDateRange: (startDate, endDate) => {
        const start = startDate.toLocaleDateString('tr-TR');
        const end = endDate.toLocaleDateString('tr-TR');
        if (start === end) {
            return start;
        }
        return `${start} - ${end}`;
    },
    getTimeSlots: (startTime, endTime, slotDuration = 60) => {
        const slots = [];
        const startTimeParts = startTime.split(':').map(Number);
        const endTimeParts = endTime.split(':').map(Number);
        const startHour = startTimeParts[0];
        const startMinute = startTimeParts[1];
        const endHour = endTimeParts[0];
        const endMinute = endTimeParts[1];
        if (startHour === undefined || startMinute === undefined ||
            endHour === undefined || endMinute === undefined) {
            return slots;
        }
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
        return slots;
    },
    isTimeInRange: (time, startTime, endTime) => {
        const timeMinutes = exports.DateHelpers.timeToMinutes(time);
        const startMinutes = exports.DateHelpers.timeToMinutes(startTime);
        const endMinutes = exports.DateHelpers.timeToMinutes(endTime);
        return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    },
    timeToMinutes: (time) => {
        const timeParts = time.split(':').map(Number);
        const hour = timeParts[0];
        const minute = timeParts[1];
        if (hour === undefined || minute === undefined) {
            return 0;
        }
        return hour * 60 + minute;
    },
    minutesToTime: (minutes) => {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    },
    getEstimatedDeliveryDate: (pickupDate, serviceType) => {
        switch (serviceType) {
            case 'same_day':
                return pickupDate;
            case 'next_day':
                return exports.DateHelpers.getNextBusinessDay(pickupDate);
            case 'express':
                return exports.DateHelpers.addDays(exports.DateHelpers.getNextBusinessDay(pickupDate), 1);
            case 'standard':
                return exports.DateHelpers.addDays(pickupDate, 3);
            case 'scheduled':
                return exports.DateHelpers.addDays(pickupDate, 7);
            default:
                return exports.DateHelpers.addDays(pickupDate, 3);
        }
    },
    parseTurkishDate: (dateStr) => {
        const formats = [
            /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
            /(\d{4})-(\d{1,2})-(\d{1,2})/,
        ];
        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                const [, first, second, third] = match;
                if (!first || !second || !third) {
                    continue;
                }
                if (format === formats[2]) {
                    return new Date(parseInt(first), parseInt(second) - 1, parseInt(third));
                }
                else {
                    return new Date(parseInt(third), parseInt(second) - 1, parseInt(first));
                }
            }
        }
        return null;
    },
    getTurkishMonthName: (monthIndex) => {
        const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        return months[monthIndex] || '';
    },
    getTurkishDayName: (dayIndex) => {
        const days = [
            'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
        ];
        return days[dayIndex] || '';
    }
};
exports.default = exports.DateHelpers;
//# sourceMappingURL=date-helpers.js.map