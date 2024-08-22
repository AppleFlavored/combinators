import { many1, map, sequence } from "./parser";
import { letter, literal, whitespace } from "./text";

const result = map(
    sequence(
        literal('fn'),
        many1(whitespace()),
        map(many1(letter()), (letters) => letters.join('')),
    ),
    ([_, __, name]) => `FUNCTION ${name}`,
)('fn main');

console.log(result);