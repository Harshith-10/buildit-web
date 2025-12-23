export interface SeedProblem {
  title: string;
  slug: string; // Add slug to interface
  type: "coding";
  difficulty: "easy" | "medium" | "hard";
  description: string;
  driverCode?: Record<string, string>;
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
}

export const problems: SeedProblem[] = [
  {
    title: "Two Sum",
    slug: "two-sum",
    type: "coding",
    difficulty: "easy",
    description: `
# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

## Example 1:

\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Example 2:

\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

## Example 3:

\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

## Constraints:

- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**
`,
    driverCode: {
      python: `def two_sum(nums, target):
    # Write your code here...
    pass

# region boilerplate
if __name__ == "__main__":
    nums = list(map(int, input().split(",")))
    target = int(input())
    print(two_sum(nums, target))
# endregion`,
      java: `// region boilerplate
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i]);
        }
        int target = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
// endregion
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here...
        return new int[]{};
    }
// region boilerplate
}
// endregion`,
    },
    testCases: [
      {
        input: "2,7,11,15\n9",
        expectedOutput: "[0,1]",
        isHidden: false,
      },
      {
        input: "3,2,4\n6",
        expectedOutput: "[1,2]",
        isHidden: false,
      },
      {
        input: "3,3\n6",
        expectedOutput: "[0,1]",
        isHidden: false,
      },
      {
        input: "1,2,3,4,5\n9",
        expectedOutput: "[3,4]",
        isHidden: true,
      },
      {
        input: "1,2,3\n4",
        expectedOutput: "[0,2]",
        isHidden: true,
      },
    ],
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    type: "coding",
    difficulty: "easy",
    description: `
# Valid Parentheses

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## Example 1:

\`\`\`
Input: s = "()"
Output: true
\`\`\`

## Example 2:

\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

## Example 3:

\`\`\`
Input: s = "(]"
Output: false
\`\`\`

## Constraints:

- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'.\`
`,
    testCases: [
      {
        input: '"()"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: '"()[]{}"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: '"(]"',
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: '"([)]"',
        expectedOutput: "false",
        isHidden: true,
      },
      {
        input: '"{[]}"',
        expectedOutput: "true",
        isHidden: true,
      },
    ],
  },
  {
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    type: "coding",
    difficulty: "easy",
    description: `
# Merge Two Sorted Lists

You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.

## Example 1:

\`\`\`
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
\`\`\`

## Example 2:

\`\`\`
Input: list1 = [], list2 = []
Output: []
\`\`\`

## Example 3:

\`\`\`
Input: list1 = [], list2 = [0]
Output: [0]
\`\`\`

## Constraints:

- The number of nodes in both lists is in the range \`[0, 50]\`.
- \`-100 <= Node.val <= 100\`
- Both \`list1\` and \`list2\` are sorted in **non-decreasing** order.
`,
    testCases: [
      {
        input: '{"list1": [1,2,4], "list2": [1,3,4]}',
        expectedOutput: "[1,1,2,3,4,4]",
        isHidden: false,
      },
      {
        input: '{"list1": [], "list2": []}',
        expectedOutput: "[]",
        isHidden: false,
      },
      {
        input: '{"list1": [], "list2": [0]}',
        expectedOutput: "[0]",
        isHidden: false,
      },
      {
        input: '{"list1": [1], "list2": [2]}',
        expectedOutput: "[1,2]",
        isHidden: true,
      },
      {
        input: '{"list1": [1,3,5], "list2": [2,4,6]}',
        expectedOutput: "[1,2,3,4,5,6]",
        isHidden: true,
      },
    ],
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    type: "coding",
    difficulty: "easy",
    description: `
# Best Time to Buy and Sell Stock

You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`ith\` day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return *the maximum profit you can achieve from this transaction*. If you cannot achieve any profit, return \`0\`.

## Example 1:

\`\`\`
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.
\`\`\`

## Example 2:

\`\`\`
Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.
\`\`\`

## Constraints:

- \`1 <= prices.length <= 10^5\`
- \`0 <= prices[i] <= 10^4\`
`,
    testCases: [
      {
        input: "[7,1,5,3,6,4]",
        expectedOutput: "5",
        isHidden: false,
      },
      {
        input: "[7,6,4,3,1]",
        expectedOutput: "0",
        isHidden: false,
      },
      {
        input: "[2,4,1]",
        expectedOutput: "2",
        isHidden: false,
      },
      {
        input: "[1,2]",
        expectedOutput: "1",
        isHidden: true,
      },
      {
        input: "[3,2,6,5,0,3]",
        expectedOutput: "4",
        isHidden: true,
      },
    ],
  },
  {
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    type: "coding",
    difficulty: "easy",
    description: `
# Valid Palindrome

A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` *if it is a palindrome, or* \`false\` *otherwise*.

## Example 1:

\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\`

## Example 2:

\`\`\`
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.
\`\`\`

## Example 3:

\`\`\`
Input: s = " "
Output: true
Explanation: s is an empty string "" after removing non-alphanumeric characters.
Since an empty string reads the same forward and backward, it is a palindrome.
\`\`\`

## Constraints:

- \`1 <= s.length <= 2 * 10^5\`
- \`s\` consists only of printable ASCII characters.
`,
    testCases: [
      {
        input: '"A man, a plan, a canal: Panama"',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: '"race a car"',
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: '" "',
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: '"ab_a"',
        expectedOutput: "true",
        isHidden: true,
      },
      {
        input: '"0P"',
        expectedOutput: "false",
        isHidden: true,
      },
    ],
  },
];
