export const SPLIT_SCHEDULES = {
  "Back & Biceps / Chest & Triceps / Legs & Shoulders": {
    daysPerWeek: 6,
    rotationDays: 3,
    schedule: {
      Monday: { session: "Back & Biceps Density", category: "Back", isRest: false, pairedWith: "Thursday" },
      Tuesday: { session: "Chest & Triceps Power", category: "Chest", isRest: false, pairedWith: "Friday" },
      Wednesday: { session: "Legs & Shoulders Power", category: "Legs", isRest: false, pairedWith: "Saturday" },
      Thursday: { session: "Back & Biceps Density", category: "Back", isRest: false, pairedWith: "Monday" },
      Friday: { session: "Chest & Triceps Power", category: "Chest", isRest: false, pairedWith: "Tuesday" },
      Saturday: { session: "Legs & Shoulders Power", category: "Legs", isRest: false, pairedWith: "Wednesday" },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Push / Pull / Legs (PPL)": {
    daysPerWeek: 6,
    rotationDays: 3,
    schedule: {
      Monday: { session: "Push Day (Chest, Shoulders & Triceps)", category: "Chest", isRest: false, pairedWith: "Thursday" },
      Tuesday: { session: "Pull Day (Back & Biceps)", category: "Back", isRest: false, pairedWith: "Friday" },
      Wednesday: { session: "Legs Day (Quads, Hamstrings & Calves)", category: "Legs", isRest: false, pairedWith: "Saturday" },
      Thursday: { session: "Push Day (Chest, Shoulders & Triceps)", category: "Chest", isRest: false, pairedWith: "Monday" },
      Friday: { session: "Pull Day (Back & Biceps)", category: "Back", isRest: false, pairedWith: "Tuesday" },
      Saturday: { session: "Legs Day (Quads, Hamstrings & Calves)", category: "Legs", isRest: false, pairedWith: "Wednesday" },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Chest & Biceps / Back & Triceps / Legs & Core": {
    daysPerWeek: 6,
    rotationDays: 3,
    schedule: {
      Monday: { session: "Chest & Biceps Hypertrophy", category: "Chest", isRest: false, pairedWith: "Thursday" },
      Tuesday: { session: "Back & Triceps Density", category: "Back", isRest: false, pairedWith: "Friday" },
      Wednesday: { session: "Legs & Core Power", category: "Legs", isRest: false, pairedWith: "Saturday" },
      Thursday: { session: "Chest & Biceps Hypertrophy", category: "Chest", isRest: false, pairedWith: "Monday" },
      Friday: { session: "Back & Triceps Density", category: "Back", isRest: false, pairedWith: "Tuesday" },
      Saturday: { session: "Legs & Core Power", category: "Legs", isRest: false, pairedWith: "Wednesday" },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Full Body (3x / week)": {
    daysPerWeek: 6,
    rotationDays: 3,
    schedule: {
      Monday: { session: "Full Body Strength A", category: "Full Body", isRest: false, pairedWith: "Thursday" },
      Tuesday: { session: "Full Body Hypertrophy B", category: "Full Body", isRest: false, pairedWith: "Friday" },
      Wednesday: { session: "Full Body Power C", category: "Full Body", isRest: false, pairedWith: "Saturday" },
      Thursday: { session: "Full Body Strength A", category: "Full Body", isRest: false, pairedWith: "Monday" },
      Friday: { session: "Full Body Hypertrophy B", category: "Full Body", isRest: false, pairedWith: "Tuesday" },
      Saturday: { session: "Full Body Power C", category: "Full Body", isRest: false, pairedWith: "Wednesday" },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Bro Split (Chest, Back, Legs, Shoulders, Arms)": {
    daysPerWeek: 5,
    rotationDays: 5,
    schedule: {
      Monday: { session: "Chest Day", category: "Chest", isRest: false, pairedWith: null },
      Tuesday: { session: "Back Day", category: "Back", isRest: false, pairedWith: null },
      Wednesday: { session: "Legs Day", category: "Legs", isRest: false, pairedWith: null },
      Thursday: { session: "Shoulders Day", category: "Strength", isRest: false, pairedWith: null },
      Friday: { session: "Arms Day", category: "Strength", isRest: false, pairedWith: null },
      Saturday: { session: "Saturday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Bro Split": {
    daysPerWeek: 5,
    rotationDays: 5,
    schedule: {
      Monday: { session: "Chest Day", category: "Chest", isRest: false, pairedWith: null },
      Tuesday: { session: "Back Day", category: "Back", isRest: false, pairedWith: null },
      Wednesday: { session: "Legs Day", category: "Legs", isRest: false, pairedWith: null },
      Thursday: { session: "Shoulders Day", category: "Strength", isRest: false, pairedWith: null },
      Friday: { session: "Arms Day", category: "Strength", isRest: false, pairedWith: null },
      Saturday: { session: "Saturday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Upper / Lower Split": {
    daysPerWeek: 4,
    rotationDays: 4,
    schedule: {
      Monday: { session: "Upper Body Power", category: "Strength", isRest: false, pairedWith: "Thursday" },
      Tuesday: { session: "Lower Body Power", category: "Legs", isRest: false, pairedWith: "Friday" },
      Wednesday: { session: "Mid-Week Active Recovery", category: "Recovery", isRest: true, pairedWith: null },
      Thursday: { session: "Upper Body Hypertrophy", category: "Hypertrophy", isRest: false, pairedWith: "Monday" },
      Friday: { session: "Lower Body Hypertrophy", category: "Legs", isRest: false, pairedWith: "Tuesday" },
      Saturday: { session: "Weekend Conditioning / Rest", category: "Recovery", isRest: true, pairedWith: null },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Arnold Split (Chest & Back, Shoulders & Arms, Legs)": {
    daysPerWeek: 6,
    rotationDays: 3,
    schedule: {
      Monday: { session: "Chest & Back Density", category: "Chest", isRest: false, pairedWith: "Thursday" },
      Tuesday: { session: "Shoulders & Arms Builder", category: "Strength", isRest: false, pairedWith: "Friday" },
      Wednesday: { session: "Legs Power & Calves", category: "Legs", isRest: false, pairedWith: "Saturday" },
      Thursday: { session: "Chest & Back Density", category: "Chest", isRest: false, pairedWith: "Monday" },
      Friday: { session: "Shoulders & Arms Builder", category: "Strength", isRest: false, pairedWith: "Tuesday" },
      Saturday: { session: "Legs Power & Calves", category: "Legs", isRest: false, pairedWith: "Wednesday" },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
  "Arnold Split": {
    daysPerWeek: 6,
    rotationDays: 3,
    schedule: {
      Monday: { session: "Chest & Back Density", category: "Chest", isRest: false, pairedWith: "Thursday" },
      Tuesday: { session: "Shoulders & Arms Builder", category: "Strength", isRest: false, pairedWith: "Friday" },
      Wednesday: { session: "Legs Power & Calves", category: "Legs", isRest: false, pairedWith: "Saturday" },
      Thursday: { session: "Chest & Back Density", category: "Chest", isRest: false, pairedWith: "Monday" },
      Friday: { session: "Shoulders & Arms Builder", category: "Strength", isRest: false, pairedWith: "Tuesday" },
      Saturday: { session: "Legs Power & Calves", category: "Legs", isRest: false, pairedWith: "Wednesday" },
      Sunday: { session: "Sunday Rest & Recovery", category: "Recovery", isRest: true, pairedWith: null },
    },
  },
};

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function isThreeDaySplit(splitName) {
  if (!splitName) return false;
  return Boolean(SPLIT_SCHEDULES[splitName]);
}

export function getDayName(date = new Date()) {
  return DAYS_OF_WEEK[date.getDay()];
}

export function getNextTrainingDay(splitName, fromDayName = null) {
  const currentDay = fromDayName || getDayName();
  const splitInfo = SPLIT_SCHEDULES[splitName];
  if (!splitInfo) return null;

  const currentIdx = DAYS_OF_WEEK.indexOf(currentDay);
  if (currentIdx === -1) return null;

  // Search forward for the next non-rest day
  for (let offset = 1; offset <= 7; offset++) {
    const nextIdx = (currentIdx + offset) % 7;
    const dayName = DAYS_OF_WEEK[nextIdx];
    const dayData = splitInfo.schedule[dayName];
    if (dayData && !dayData.isRest) {
      return {
        dayName,
        session: dayData.session,
        category: dayData.category,
        daysAway: offset,
      };
    }
  }

  return null;
}

export function getTodaySchedule(splitName, dayName = null) {
  const targetDay = dayName || getDayName();
  const splitInfo = SPLIT_SCHEDULES[splitName];
  if (!splitInfo) return null;

  const dayData = splitInfo.schedule[targetDay];
  if (!dayData) return null;

  const nextTraining = dayData.isRest ? getNextTrainingDay(splitName, targetDay) : null;

  return {
    dayName: targetDay,
    isSunday: targetDay === "Sunday",
    isRest: dayData.isRest,
    session: dayData.session,
    category: dayData.category,
    nextTraining,
  };
}

