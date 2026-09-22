import { SampleCase } from "../types";

export const SAMPLE_CASES: SampleCase[] = [
  {
    title: "Unclosed Parenthesis",
    errorLabel: "SyntaxError",
    code: `print("Hello"`,
    error: `SyntaxError: '(' was never closed`,
    description: "Missing closing parenthesis in function call"
  },
  {
    title: "Mismatched Indentation",
    errorLabel: "IndentationError",
    code: `def calculate_total(prices):
    total = 0
  for p in prices:
        total += p
    return total

print(calculate_total([10, 25, 40]))`,
    error: `IndentationError: unindent does not match any outer indentation level`,
    description: "Inconsistent indentation spacing within a function block"
  },
  {
    title: "Type Concatenation Mismatch",
    errorLabel: "TypeError",
    code: `user_name = "Alex"
user_score = 98

message = "Player " + user_name + " achieved score: " + user_score
print(message)`,
    error: `TypeError: can only concatenate str (not "int") to str`,
    description: "Attempting to concatenate an integer directly with string primitives"
  },
  {
    title: "Missing Dictionary Key / KeyError",
    errorLabel: "KeyError",
    code: `user_profile = {
    "username": "coder42",
    "verified": True
}

email = user_profile["email"]
print(f"Sending notice to {email}")`,
    error: `KeyError: 'email'`,
    description: "Accessing a dictionary key without checking or using .get()"
  },
  {
    title: "Zero Division Error",
    errorLabel: "ZeroDivisionError",
    code: `def compute_average(total_sum, count):
    return total_sum / count

scores = []
avg = compute_average(sum(scores), len(scores))
print(f"Average: {avg}")`,
    error: `ZeroDivisionError: division by zero`,
    description: "Division by an unverified zero denominator in empty list calculations"
  }
];
