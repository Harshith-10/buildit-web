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
      c: `// region boilerplate
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// endregion
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(const int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here...
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    result[0] = 0;
    result[1] = 1;
    return result;
}
// region boilerplate

int main() {
    char line[1024];
    if (!fgets(line, 1024, stdin)) return 0;
    
    // Remove newline
    line[strcspn(line, "\\n")] = 0;

    int nums[1000];
    int size = 0;
    char* token = strtok(line, ",");
    while (token) {
        nums[size++] = atoi(token);
        token = strtok(NULL, ",");
    }

    if (!fgets(line, 1024, stdin)) return 0;
    int target = atoi(line);

    int returnSize;
    int* result = twoSum(nums, size, target, &returnSize);

    if (returnSize == 2) {
        printf("[%d,%d]", result[0], result[1]);
    } else {
        printf("[]");
    }
    
    if (result) free(result);
    return 0;
}
// endregion`,
      cpp: `// region boilerplate
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

class Solution {
public:
// endregion
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here...
        return {};
    }
// region boilerplate
};

int main() {
    string line;
    getline(cin, line);
    
    stringstream ss(line);
    string item;
    vector<int> nums;
    while (getline(ss, item, ',')) {
        nums.push_back(stoi(item));
    }
    
    string targetStr;
    getline(cin, targetStr);
    int target = stoi(targetStr);
    
    Solution sol;
    vector<int> result = sol.twoSum(nums, target);
    
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}
// endregion`,
      java: `// region boilerplate
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().split(",");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                nums[i] = Integer.parseInt(parts[i]);
            }
            if (sc.hasNextInt()) {
                int target = sc.nextInt();
                int[] result = twoSum(nums, target);
                System.out.println(Arrays.toString(result).replace(" ", ""));
            }
        }
        sc.close();
    }
// endregion
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here...
        return new int[]{};
    }
// region boilerplate
}
// endregion`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here...
};

// region boilerplate
const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (input.length >= 2) {
        const nums = input[0].split(',').map(Number);
        const target = Number(input[1]);
        const result = twoSum(nums, target);
        console.log(JSON.stringify(result));
    }
} catch (e) {}
// endregion`,
      python: `def two_sum(nums, target):
    # Write your code here...
    pass

# region boilerplate
if __name__ == "__main__":
    import sys
    input = sys.stdin.read().split()
    if len(input) >= 2:
        nums = list(map(int, input[0].split(",")))
        target = int(input[1])
        print(str(two_sum(nums, target)).replace(" ", ""))
# endregion`,
      rust: `// region boilerplate
struct Solution;
// endregion

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Write your code here...
        vec![]
    }
}

// region boilerplate
use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    
    if let Some(Ok(nums_str)) = lines.next() {
        let nums: Vec<i32> = nums_str.split(',')
            .filter_map(|s| s.trim().parse().ok())
            .collect();
            
        if let Some(Ok(target_str)) = lines.next() {
            if let Ok(target) = target_str.trim().parse() {
                let result = Solution::two_sum(nums, target);
                let res_str = format!("{:?}", result).replace(" ", "");
                println!("{}", res_str);
            }
        }
    }
}
// endregion`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your code here...
    return [];
}

// region boilerplate
import * as fs from 'fs';

try {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (input.length >= 2) {
        const nums = input[0].split(',').map(Number);
        const target = Number(input[1]);
        const result = twoSum(nums, target);
        console.log(JSON.stringify(result));
    }
} catch (e) {}
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
    driverCode: {
      c: `// region boilerplate
#include <stdio.h>
#include <stdbool.h>
#include <string.h>

// endregion
bool isValid(char* s) {
    // Write your code here...
    return false;
}
// region boilerplate

int main() {
    char s[1024];
    if (fgets(s, 1024, stdin)) {
        s[strcspn(s, "\\n")] = 0; // Remove newline
        if (isValid(s)) {
            printf("true");
        } else {
            printf("false");
        }
    }
    return 0;
}
// endregion`,
      cpp: `// region boilerplate
#include <iostream>
#include <string>
#include <stack>

using namespace std;

class Solution {
public:
// endregion
    bool isValid(string s) {
        // Write your code here...
        return false;
    }
// region boilerplate
};

int main() {
    string s;
    getline(cin, s);
    Solution sol;
    if (sol.isValid(s)) {
        cout << "true";
    } else {
        cout << "false";
    }
    return 0;
}
// endregion`,
      java: `// region boilerplate
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            boolean result = isValid(s);
            System.out.println(result);
        }
        sc.close();
    }
// endregion
    public static boolean isValid(String s) {
        // Write your code here...
        return false;
    }
// region boilerplate
}
// endregion`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Write your code here...
};

// region boilerplate
const fs = require('fs');
try {
    const s = fs.readFileSync(0, 'utf-8').trim();
    console.log(isValid(s));
} catch(e) {}
// endregion`,
      python: `def is_valid(s):
    # Write your code here...
    pass

# region boilerplate
if __name__ == "__main__":
    import sys
    s = sys.stdin.read().strip()
    print("true" if is_valid(s) else "false")
# endregion`,
      rust: `// region boilerplate
struct Solution;
// endregion

impl Solution {
    pub fn is_valid(s: String) -> bool {
        // Write your code here...
        false
    }
}

// region boilerplate
use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    if let Some(Ok(s)) = stdin.lock().lines().next() {
        let result = Solution::is_valid(s);
        println!("{}", result);
    }
}
// endregion`,
      typescript: `function isValid(s: string): boolean {
    // Write your code here...
    return false;
}

// region boilerplate
import * as fs from 'fs';

try {
    const s = fs.readFileSync(0, 'utf-8').trim();
    console.log(isValid(s));
} catch(e) {}
// endregion`,
    },
    testCases: [
      {
        input: "()",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "()[]{}",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "(]",
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: "([)]",
        expectedOutput: "false",
        isHidden: true,
      },
      {
        input: "{[]}",
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
        input: "[1,2,4]\n[1,3,4]",
        expectedOutput: "[1,1,2,3,4,4]",
        isHidden: false,
      },
      {
        input: "[]\n[]",
        expectedOutput: "[]",
        isHidden: false,
      },
      {
        input: "[]\n[0]",
        expectedOutput: "[0]",
        isHidden: false,
      },
      {
        input: "[1]\n[2]",
        expectedOutput: "[1,2]",
        isHidden: true,
      },
      {
        input: "[1,3,5]\n[2,4,6]",
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
        input: "7,1,5,3,6,4",
        expectedOutput: "5",
        isHidden: false,
      },
      {
        input: "7,6,4,3,1",
        expectedOutput: "0",
        isHidden: false,
      },
      {
        input: "2,4,1",
        expectedOutput: "2",
        isHidden: false,
      },
      {
        input: "1,2",
        expectedOutput: "1",
        isHidden: true,
      },
      {
        input: "3,2,6,5,0,3",
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
    driverCode: {
      c: `// region boilerplate
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <ctype.h>

// endregion
bool isPalindrome(char* s) {
    // Write your code here...
    return false;
}
// region boilerplate

int main() {
    char s[200005];
    if (fgets(s, 200005, stdin)) {
        s[strcspn(s, "\\n")] = 0; // Remove newline
        if (isPalindrome(s)) {
            printf("true");
        } else {
            printf("false");
        }
    }
    return 0;
}
// endregion`,
      cpp: `// region boilerplate
#include <iostream>
#include <string>
#include <vector>

using namespace std;

class Solution {
public:
// endregion
    bool isPalindrome(string s) {
        // Write your code here...
        return false;
    }
// region boilerplate
};

int main() {
    string s;
    getline(cin, s);
    Solution sol;
    if (sol.isPalindrome(s)) {
        cout << "true";
    } else {
        cout << "false";
    }
    return 0;
}
// endregion`,
      java: `// region boilerplate
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            boolean result = isPalindrome(s);
            System.out.println(result);
        }
        sc.close();
    }
// endregion
    public static boolean isPalindrome(String s) {
        // Write your code here...
        return false;
    }
// region boilerplate
}
// endregion`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
    // Write your code here...
};

// region boilerplate
const fs = require('fs');
try {
    // Read entire input, split by newline, take first line
    // preserve spaces exactly as given (except newline)
    const input = fs.readFileSync(0, 'utf-8');
    const s = input.split('\\n')[0]; 
    console.log(isPalindrome(s));
} catch(e) {}
// endregion`,
      python: `def is_palindrome(s):
    # Write your code here...
    pass

# region boilerplate
if __name__ == "__main__":
    import sys
    # Read strict line, remove only trailing newline
    input_str = sys.stdin.read().split('\\n')[0]
    print("true" if is_palindrome(input_str) else "false")
# endregion`,
      rust: `// region boilerplate
struct Solution;
// endregion

impl Solution {
    pub fn is_palindrome(s: String) -> bool {
        // Write your code here...
        false
    }
}

// region boilerplate
use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    if let Some(Ok(s)) = stdin.lock().lines().next() {
        let result = Solution::is_palindrome(s);
        println!("{}", result);
    }
}
// endregion`,
      typescript: `function isPalindrome(s: string): boolean {
    // Write your code here...
    return false;
}

// region boilerplate
import * as fs from 'fs';

try {
    const input = fs.readFileSync(0, 'utf-8');
    const s = input.split('\\n')[0];
    console.log(isPalindrome(s));
} catch(e) {}
// endregion`,
    },
    testCases: [
      {
        input: "A man, a plan, a canal: Panama",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "race a car",
        expectedOutput: "false",
        isHidden: false,
      },
      {
        input: " ",
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: "ab_a",
        expectedOutput: "true",
        isHidden: true,
      },
      {
        input: "0P",
        expectedOutput: "false",
        isHidden: true,
      },
    ],
  },
];
