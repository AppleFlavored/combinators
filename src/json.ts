import { failure, lazy, many0, many1, map, optional, or, Parser, separated, sequence, success } from "./parser";
import { digit, hexDigit, literal, whitespace } from "./text";

interface JsonObject {
    [key: string]: JsonValue;
}

type JsonValue =
    | JsonObject
    | Array<JsonValue>
    | string
    | number
    | boolean
    | null;

const jsonWhitespace = many0(whitespace());

const onenine = (input: string) => {
    const char = input.charAt(0);
    if (char >= '1' && char <= '9') {
        return success(char, input.substring(1));
    }
    return failure(input);
}

const fraction = optional(joinString(sequence(literal('.'), many1(digit()))));

const sign = optional(or(literal('+'), literal('-')));

const exponent = optional(joinString(sequence(or(literal('e'), literal('E')), sign, many1(digit()))));

const integer = map(
    joinString(or(
        sequence(literal('-'), onenine, many1(digit())),
        sequence(literal('-'), digit()),
        sequence(onenine, many1(digit())),
        sequence(digit()),
    )),
    (int) => int,
);

const jsonNumber = map(
    sequence(integer, fraction, exponent),
    (parts) => parseFloat(parts.join('')),
);

const escapeCharacter = or(
    literal('\"'),
    literal('\\'),
    literal('/'),
    literal('b'),
    literal('f'),
    literal('n'),
    literal('r'),
    literal('t'),
    map(sequence(literal('u'), hexDigit(), hexDigit(), hexDigit(), hexDigit()), ([, ...hex]) => hex.join(''))
);

const jsonCharacter = or(
    (input: string) => {
        const char = input.charAt(0);
        if (char >= '\u0020' && char <= '\u10ff' && char !== '\"' && char !== '\\') {
            return success(char, input.substring(1));
        }
        return failure(input);
    },
    map(sequence(literal('\\'), escapeCharacter), ([...r]) => r.join('')),
);

const jsonString = map(
    sequence(
        literal('"'),
        many0(jsonCharacter),
        literal('"'),
    ),
    ([, chars]) => chars.join(''),
);

const element: Parser<string, JsonValue> = map(
    sequence(
        jsonWhitespace,
        lazy(() => value),
        jsonWhitespace
    ),
    ([, value]) => value,
);

const elements = separated(literal(','), element);

const member = map(
    sequence(
        jsonWhitespace,
        jsonString,
        jsonWhitespace,
        literal(':'),
        element
    ),
    ([, key, , , value]) => [key, value],
);

const members = map(
    separated(literal(','), member),
    (members) => members.reduce((acc, [key, value]) => Object.assign(acc, { [key]: value }), {}),
);

const jsonObject = map(
    sequence(
        literal('{'),
        or(
            members,
            jsonWhitespace
        ),
        literal('}'),
    ),
    ([, members]) => members,
);

const jsonArray: Parser<string, JsonValue[]> = map(
    sequence(
        literal('['),
        or(
            elements,
            jsonWhitespace
        ),
        literal(']'),
    ),
    ([, elements]) => elements,
);

const value: Parser<string, JsonValue> = or(
    jsonObject,
    jsonArray,
    jsonString,
    jsonNumber,
    literal('true'),
    literal('false'),
    literal('null'),
);

function joinString(parser: Parser<any, string[]>) {
    return map(parser, (chars) => chars.flat().join(''));
}

export function json(input: string): any {
    return element(input);
}