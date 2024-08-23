import { failure, or, Parser, success } from "./parser";

export function literal(expected: string): Parser<string, string> {
    return (input) => {
        if (input.indexOf(expected) === 0) {
            return success(expected, input.substring(expected.length));
        }
        return failure(input);
    }
}

export function letter(): Parser<string, string> {
    return (input: string) => {
        if (input.length === 0) {
            return failure(input);
        }
        const firstChar = input.charAt(0);
        if (firstChar >= 'a' && firstChar <= 'z' || firstChar >= 'A' && firstChar <= 'Z') {
            return success(firstChar, input.substring(1));
        }
        return failure(input);
    }
}

export function digit(): Parser<string, string> {
    return (input: string) => {
        if (input.length === 0) {
            return failure(input);
        }
        const firstChar = input.charAt(0);
        if (firstChar >= '0' && firstChar <= '9') {
            return success(firstChar, input.substring(1));
        }
        return failure(input);
    }
}

export function hexDigit(): Parser<string, string> {
    return or(digit(), (input) => {
        const firstChar = input.charAt(0);
        if (firstChar >= 'a' && firstChar <= 'f' || firstChar >= 'A' && firstChar <= 'F') {
            return success(firstChar, input.substring(1));
        }
        return failure(input);
    });
}

export function whitespace(): Parser<string, string> {
    return or(literal(' '), literal('\t'), literal('\n'), literal('\r'));
}