export declare const DateHelpers: {
    addDays: (date: Date, days: number) => Date;
    addHours: (date: Date, hours: number) => Date;
    addMinutes: (date: Date, minutes: number) => Date;
    startOfDay: (date: Date) => Date;
    endOfDay: (date: Date) => Date;
    startOfMonth: (date: Date) => Date;
    endOfMonth: (date: Date) => Date;
    isWeekend: (date: Date) => boolean;
    isBusinessDay: (date: Date) => boolean;
    getNextBusinessDay: (date: Date) => Date;
    getBusinessDaysBetween: (startDate: Date, endDate: Date) => number;
    getTurkishHolidays: (year: number) => Date[];
    isTurkishHoliday: (date: Date) => boolean;
    calculateAge: (birthDate: Date) => number;
    formatDateRange: (startDate: Date, endDate: Date) => string;
    getTimeSlots: (startTime: string, endTime: string, slotDuration?: number) => string[];
    isTimeInRange: (time: string, startTime: string, endTime: string) => boolean;
    timeToMinutes: (time: string) => number;
    minutesToTime: (minutes: number) => string;
    getEstimatedDeliveryDate: (pickupDate: Date, serviceType: "same_day" | "next_day" | "express" | "standard" | "scheduled") => Date;
    parseTurkishDate: (dateStr: string) => Date | null;
    getTurkishMonthName: (monthIndex: number) => string;
    getTurkishDayName: (dayIndex: number) => string;
};
export default DateHelpers;
//# sourceMappingURL=date-helpers.d.ts.map