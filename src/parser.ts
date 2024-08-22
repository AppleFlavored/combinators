export type Success<Input, Output> = { success: true, value: Output, rest: Input };
export type Failure<Input> = { success: false, rest: Input };
export type Parser<Input, Output> = (input: Input) => Success<Input, Output> | Failure<Input>;

export function success<Input, Output>(value: Output, rest: Input): Success<Input, Output> {
    return { success: true, value, rest };
}

export function failure<Input>(rest: Input): Failure<Input> {
    return { success: false, rest };
}

export function or<Input, Output>(...parsers: Parser<Input, Output>[]) {
    return (input: Input) => {
        for (const parser of parsers) {
            const result = parser(input);
            if (result.success) {
                return result;
            }
        }
        return failure(input);
    }
}

export function optional<Input, Output>(parser: Parser<Input, Output>) {
    return (input: Input) => {
        const result = parser(input);
        if (result.success) {
            return result;
        }
        return success(undefined, input);
    }
}

export function many0<Input, Output>(parser: Parser<Input, Output>) {
    return (input: Input) => {
        let values: Output[] = [];
        while (true) {
            const result = parser(input);
            if (!result.success) {
                break;
            }

            values.push(result.value);
            input = result.rest;
        }
        return success(values, input);
    }
}

export function many1<Input, Output>(parser: Parser<Input, Output>) {
    return (input: Input) => {
        const result = many0(parser)(input);
        if (result.success && result.value.length > 0) {
            return result;
        }
        return failure(input);
    }
}

export function sequence<Input>(...parsers: Parser<Input, any>[]) {
    return (input: Input) => {
        const initialInput = input;
        const values: any[] = [];
        for (const parser of parsers) {
            const result = parser(input);
            if (!result.success) {
                return failure(initialInput);
            }
            values.push(result.value);
            input = result.rest;
        }
        return success(values, input);
    }
}

export function map<Input, Output, TValue>(parser: Parser<Input, Output>, fn: (value: Output) => TValue) {
    return (input: Input) => {
        const result = parser(input);
        if (!result.success) return result;
        return success(fn(result.value), result.rest);
    }
}