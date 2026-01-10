# Exam User Flow - Complete Journey

## Overview
This document describes the complete user flow from viewing exams to submitting and viewing results.

## URL Structure

### Important Note
The `(exam)` folder is a Next.js **route group** (indicated by parentheses). Route groups are for organization only and **DO NOT appear in the URL path**.

### Correct URLs:
- ❌ WRONG: `/exam/[examId]`
- ✅ CORRECT: `/[examId]`

## Complete User Flow

### 1. View Available Exams
**URL**: `/exams`
**Page**: `src/app/(dashboard)/exams/page.tsx`
**Component**: `ExamsView`

User sees:
- List of all exams (card or table view)
- Status badges (Upcoming, Ongoing, Completed)
- Start time and duration
- Two actions per exam:
  - "View Details" button → `/exams/[examId]`
  - "Start Exam" button → `/[examId]/onboarding` (only for ongoing exams)

### 2a. View Exam Details (Optional)
**URL**: `/exams/[examId]`
**Page**: `src/app/(dashboard)/exams/[examId]/page.tsx`
**Component**: `OnboardingClient` (from dashboard context)

Instructor/Admin view showing:
- Exam configuration
- Assigned problems
- Participant information
- "Start Exam" button → `/[examId]/onboarding`

### 2b. OR Go Directly to Onboarding
**URL**: `/[examId]` (redirects to `/[examId]/onboarding`)
**Page**: `src/app/(exam)/[examId]/page.tsx`

Automatically redirects to the onboarding page.

### 3. Exam Onboarding
**URL**: `/[examId]/onboarding`
**Page**: `src/app/(exam)/[examId]/onboarding/page.tsx`
**Component**: `OnboardingClient`

Student sees:
- Exam title and description
- Duration and rules
- Requirements:
  - Fullscreen mode
  - No distractions
  - Clipboard restrictions
- "I Understand, Start Exam" button

When clicked:
1. Requests fullscreen
2. Calls `initializeExamSession(examId)`
3. Redirects to → `/[examId]/session`

### 4. Exam Session (Active Exam)
**URL**: `/[examId]/session`
**Page**: `src/app/(exam)/[examId]/session/page.tsx`
**Layout**: `src/app/(exam)/[examId]/session/layout.tsx`
**Component**: `IDEShell`

Features:
- Full IDE interface with code editor
- Problem viewer
- Test case runner
- Timer countdown
- Malpractice monitoring (tab switches, copy/paste, fullscreen exits)
- Submit button

Protected by:
- Authentication check
- Session validation
- Fullscreen enforcement
- Malpractice detection

### 5. Session End / Submit
When time expires OR user submits:
1. Calls `finishExam(assignmentId)`
2. Updates assignment status to "completed"
3. Redirects to → `/[examId]/results`

If terminated due to malpractice:
1. Calls malpractice action
2. Updates assignment status to "terminated"
3. Redirects to → `/[examId]/results`

### 6. Exam Results
**URL**: `/[examId]/results`
**Page**: `src/app/(exam)/[examId]/results/page.tsx`

Shows:
- Final score
- Problems completed
- Time taken
- Individual submission results
- Pass/Fail status

## File Locations Summary

### Route Files:
- `/exams` → `src/app/(dashboard)/exams/page.tsx`
- `/exams/[examId]` → `src/app/(dashboard)/exams/[examId]/page.tsx`
- `/[examId]` → `src/app/(exam)/[examId]/page.tsx` (redirects)
- `/[examId]/onboarding` → `src/app/(exam)/[examId]/onboarding/page.tsx`
- `/[examId]/session` → `src/app/(exam)/[examId]/session/page.tsx`
- `/[examId]/results` → `src/app/(exam)/[examId]/results/page.tsx`

### Key Components:
- `src/components/layouts/exams/exams-view.tsx` - Exam list
- `src/components/layouts/exams/exam-details-view.tsx` - Exam details
- `src/components/layouts/exam/onboarding-client.tsx` - Onboarding
- `src/components/exam/ide-shell.tsx` - Exam session IDE

### Key Actions:
- `src/lib/exam/exam-actions.ts` - `initializeExamSession()`
- `src/lib/exam/exam-lifecycle.ts` - `finishExam()`
- `src/lib/exam/malpractice-actions.ts` - Malpractice handling

## Fixed Issues

### Problem: 404 Error on `/exam/[examId]`
**Root Cause**: The `(exam)` folder is a route group and doesn't add to the URL path.

**Solution**: 
- Changed all `/exam/[examId]` references to `/[examId]`
- Changed all `/exams/[examId]/session` to `/[examId]/session`
- Changed all `/exams/[examId]/results` to `/[examId]/results`

### Files Updated:
1. `src/components/layouts/exams/exams-view.tsx` - Start Exam buttons
2. `src/components/layouts/exam/onboarding-client.tsx` - Redirect to session
3. `src/components/layouts/exams/exam-details-view.tsx` - Start Exam button
4. `src/components/layouts/dashboard/student-view.tsx` - Dashboard exam link
5. `src/lib/exam/exam-lifecycle.ts` - Results redirect
6. `src/lib/exam/malpractice-actions.ts` - Results redirect
7. `src/app/(exam)/[examId]/page.tsx` - Created redirect page
8. `src/app/(exam)/layout.tsx` - Created layout file

## Testing the Flow

1. Start at: `http://localhost:3000/exams`
2. Click "Start Exam" on an ongoing exam
3. Should go to: `http://localhost:3000/[examId]/onboarding`
4. Click "I Understand, Start Exam"
5. Should go to: `http://localhost:3000/[examId]/session`
6. Complete or submit exam
7. Should go to: `http://localhost:3000/[examId]/results`

## Current Exam ID
- Exam: "awedrghbjn"
- ID: `149ba209-c31b-4f46-bc2b-c2f81f28b3e2`
- Test URL: `http://localhost:3000/149ba209-c31b-4f46-bc2b-c2f81f28b3e2/onboarding`
