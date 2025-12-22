export type Difficulty = "easy" | "medium" | "hard";

// Strategy 1: Everyone gets the exact same questions
type FixedConfig = {
  strategy: "fixed";
  problemIds: string[];
};

// Strategy 2: Pick one pre-made set at random (e.g. Set A vs Set B)
type PredefinedSetsConfig = {
  strategy: "predefined_sets";
  sets: string[][]; // Array of Array of IDs
};

// Strategy 3: N random questions from a specific collection
type RandomPoolConfig = {
  strategy: "random_pool";
  collectionId: string;
  count: number;
};

// Strategy 4: Specific distribution (e.g. 2 Easy, 1 Hard)
type DistributionConfig = {
  strategy: "distribution";
  rules: {
    collectionId?: string; // Optional: restrict to specific collection
    difficulty: Difficulty;
    count: number;
  }[];
};

export type ExamConfig =
  | FixedConfig
  | PredefinedSetsConfig
  | RandomPoolConfig
  | DistributionConfig;
