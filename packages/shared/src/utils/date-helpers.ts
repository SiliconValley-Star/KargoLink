/**
 * Date calculation and manipulation utilities
 */
export const DateHelpers = {
  /**
   * Add days to a date
   */
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Add hours to a date
   */
  addHours: (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },

  /**
   * Add minutes to a date
   */
  addMinutes: (date: Date, minutes: number): Date => {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  },

  /**
   * Get start of day
   */
  startOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  /**
   * Get end of day
   */
  endOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  /**
   * Get start of month
   */
  startOfMonth: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },

  /**
   * Get end of month
   */
  endOfMonth: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  },

  /**
   * Check if date is weekend
   */
  isWeekend: (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  },

  /**
   * Check if date is business day
   */
  isBusinessDay: (date: Date): boolean => {
    return !DateHelpers.isWeekend(date);
  },

  /**
   * Get next business day
   */
  getNextBusinessDay: (date: Date): Date => {
    let nextDay = DateHelpers.addDays(date, 1);
    
    while (DateHelpers.isWeekend(nextDay)) {
      nextDay = DateHelpers.addDays(nextDay, 1);
    }
    
    return nextDay;
  },

  /**
   * Calculate business days between two dates
   */
  getBusinessDaysBetween: (startDate: Date, endDate: Date): number => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (DateHelpers.isBusinessDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  },

  /**
   * Get Turkish holidays for a given year
   */
  getTurkishHolidays: (year: number): Date[] => {
    return [
      new Date(year, 0, 1),   // New Year's Day
      new Date(year, 3, 23),  // National Sovereignty and Children's Day
      new Date(year, 4, 1),   // Labor Day
      new Date(year, 4, 19),  // Commemoration of Atatürk
      new Date(year, 6, 15),  // Democracy and National Unity Day
      new Date(year, 7, 30),  // Victory Day
      new Date(year, 9, 29),  // Republic Day
      // Religious holidays would need calculation based on lunar calendar
    ];
  },

  /**
   * Check if date is Turkish holiday
   */
  isTurkishHoliday: (date: Date): boolean => {
    const holidays = DateHelpers.getTurkishHolidays(date.getFullYear());
    return holidays.some(holiday => 
      holiday.getDate() === date.getDate() &&
      holiday.getMonth() === date.getMonth()
    );
  },

  /**
   * Calculate age from birth date
   */
  calculateAge: (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Format date range
   */
  formatDateRange: (startDate: Date, endDate: Date): string => {
    const start = startDate.toLocaleDateString('tr-TR');
    const end = endDate.toLocaleDateString('tr-TR');
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  },

  /**
   * Get time slots for a day
   */
  getTimeSlots: (
    startTime: string, // "09:00"
    endTime: string,   // "17:00"
    slotDuration: number = 60 // minutes
  ): string[] => {
    const slots: string[] = [];
    
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

  /**
   * Check if time is in range
   */
  isTimeInRange: (time: string, startTime: string, endTime: string): boolean => {
    const timeMinutes = DateHelpers.timeToMinutes(time);
    const startMinutes = DateHelpers.timeToMinutes(startTime);
    const endMinutes = DateHelpers.timeToMinutes(endTime);
    
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  },

  /**
   * Convert time string to minutes
   */
  timeToMinutes: (time: string): number => {
    const timeParts = time.split(':').map(Number);
    const hour = timeParts[0];
    const minute = timeParts[1];
    
    if (hour === undefined || minute === undefined) {
      return 0;
    }
    
    return hour * 60 + minute;
  },

  /**
   * Convert minutes to time string
   */
  minutesToTime: (minutes: number): string => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  },

  /**
   * Get estimated delivery date based on service type
   */
  getEstimatedDeliveryDate: (
    pickupDate: Date,
    serviceType: 'same_day' | 'next_day' | 'express' | 'standard' | 'scheduled'
  ): Date => {
    switch (serviceType) {
      case 'same_day':
        return pickupDate;
      case 'next_day':
        return DateHelpers.getNextBusinessDay(pickupDate);
      case 'express':
        return DateHelpers.addDays(DateHelpers.getNextBusinessDay(pickupDate), 1);
      case 'standard':
        return DateHelpers.addDays(pickupDate, 3);
      case 'scheduled':
        return DateHelpers.addDays(pickupDate, 7);
      default:
        return DateHelpers.addDays(pickupDate, 3);
    }
  },

  /**
   * Parse Turkish date string
   */
  parseTurkishDate: (dateStr: string): Date | null => {
    // Handle various Turkish date formats
    const formats = [
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/, // DD.MM.YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,  // YYYY-MM-DD
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const [, first, second, third] = match;
        
        if (!first || !second || !third) {
          continue;
        }
        
        // Determine if it's DD.MM.YYYY or YYYY-MM-DD
        if (format === formats[2]) {
          return new Date(parseInt(first), parseInt(second) - 1, parseInt(third));
        } else {
          return new Date(parseInt(third), parseInt(second) - 1, parseInt(first));
        }
      }
    }

    return null;
  },

  /**
   * Get Turkish month name
   */
  getTurkishMonthName: (monthIndex: number): string => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return months[monthIndex] || '';
  },

  /**
   * Get Turkish day name
   */
  getTurkishDayName: (dayIndex: number): string => {
    const days = [
      'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
    ];
    return days[dayIndex] || '';
  }
};

export default DateHelpers;