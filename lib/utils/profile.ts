/**
 * Profile completion utilities
 */

export interface UserProfile {
  // Basic Demographics
  age: number | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  education: string | null;
  maritalStatus: 'Married' | 'Unmarried' | null;
  
  // Professional Info
  currentlyEmployed: boolean | null;
  experienceMonths: number | null;
  willingToRelocate: boolean | null;
  
  // Additional Fields
  hasAcquaintance: boolean | null;
  
  // Completion Tracking
  profileCompleted: boolean;
  profileCompletionPercentage: number;
}

export interface ProfileCompletionResult {
  completed: boolean;
  percentage: number;
  missingFields: string[];
}

const REQUIRED_FIELDS: (keyof UserProfile)[] = [
  'age',
  'gender',
  'education',
  'currentlyEmployed',
  'experienceMonths',
  'willingToRelocate'
];

const OPTIONAL_FIELDS: (keyof UserProfile)[] = [
  'hasAcquaintance',
  'maritalStatus'
];

export function calculateProfileCompletion(profile: Partial<UserProfile>): ProfileCompletionResult {
  // Check required fields
  const missingFields = REQUIRED_FIELDS.filter(
    field => profile[field] === null || profile[field] === undefined
  );
  
  const completed = missingFields.length === 0;
  
  // Calculate percentage
  const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
  const completedCount = allFields.filter(
    field => profile[field] !== null && profile[field] !== undefined
  ).length;
  
  const percentage = Math.round((completedCount / allFields.length) * 100);
  
  return {
    completed,
    percentage,
    missingFields: missingFields as string[]
  };
}

export function getDefaultProfile(): UserProfile {
  return {
    age: null,
    gender: null,
    education: null,
    maritalStatus: null,
    currentlyEmployed: null,
    experienceMonths: null,
    willingToRelocate: null,
    hasAcquaintance: null,
    profileCompleted: false,
    profileCompletionPercentage: 0
  };
}

export function mergeProfileWithCompletion(profile: Partial<UserProfile>): UserProfile {
  const defaultProfile = getDefaultProfile();
  const merged = { ...defaultProfile, ...profile };
  const completion = calculateProfileCompletion(merged);
  
  return {
    ...merged,
    profileCompleted: completion.completed,
    profileCompletionPercentage: completion.percentage
  };
}

