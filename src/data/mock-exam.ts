// import { difficulty, problemType } from "@/db/schema/enums";

export const MOCK_EXAM = {
  id: "mock-exam-1",
  title: "Frontend Engineering Assessment",
  durationMinutes: 90,
  startTime: new Date().toISOString(),
  questions: [
    {
      id: "p1",
      title: "1. Two Sum",
      difficulty: "easy",
      type: "code",
      status: "solved",
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Constraints:**
* \`2 <= nums.length <= 10^4\`
* \`-10^9 <= nums[i] <= 10^9\`
* \`-10^9 <= target <= 10^9\`
* **Only one valid answer exists.**
`,
      defaultCode: `function twoSum(nums, target) {
  // Write your code here
};`,
      testCases: [
        { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
        { input: "nums = [3,3], target = 6", expected: "[0,1]" },
      ],
    },
    {
      id: "p2",
      title: "2. Valid Parentheses",
      difficulty: "medium",
      type: "code",
      status: "unsolved",
      description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`
`,
      defaultCode: `function isValid(s) {
  // Write your code here
};`,
      testCases: [
        { input: 's = "()"', expected: "true" },
        { input: 's = "()[]{}"', expected: "true" },
        { input: 's = "(]"', expected: "false" },
      ],
    },
    {
      id: "p3",
      title: "3. Merge Intervals",
      difficulty: "hard",
      type: "code",
      status: "unsolved",
      description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

**Example 1:**
\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
\`\`\`
`,
      defaultCode: `function merge(intervals) {
  // Write your code here
};`,
      testCases: [
        {
          input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
          expected: "[[1,6],[8,10],[15,18]]",
        },
        { input: "intervals = [[1,4],[4,5]]", expected: "[[1,5]]" },
      ],
    },
  ],
};
