/**
 * A constant that serves as the value for wildcard matching. This constant is
 * not exported, it serves as the only source of the wildcard value. Other
 * constants point to its value are exported. @see _
 */
const WILDCARD_VALUE = '__primitive__match__wildcard__value__'

type Operator = 'either' | 'neither'

type Operation = {
    operator: Operator
    elements: ReadonlyArray<any>
}

const operation = (
    operator: Operation['operator'],
    elements: ReadonlyArray<any>
): Operation => ({
    operator,
    elements,
})

const either = (...elements: ReadonlyArray<any>) =>
    operation('either', elements)

const neither = (...elements: ReadonlyArray<any>) =>
    operation('neither', elements)

type PositiveMatch = {
    matches: true
    result: any
}

type NegativeMatch = {
    matches: false
}

/**
 * `MatchResult` is an Algebric Data Type that defines the return type for the
 * {@link when} function.
 */
type MatchResult = PositiveMatch | NegativeMatch

/**
 * `match` is a higher order function that takes any number of values of any type
 * and returns a function that accepts any number of functions that have a
 * return type of {@link MatchResult}
 */
const match = (...values: ReadonlyArray<any>) => (...whens: Function[]) =>
    whens
        .map((when) => when(values))
        .find(({ matches, result }) => matches && result)?.result

/**
 * `when` is a higher order function that receives an array of the same length as
 * the values provided to the parent {@link match} function, and a result which
 * will be returned as the `result` in {@link PositiveMatch} in case of a
 * positive match.
 *
 * `when` performs the pattern matching using reference type and value equality. It
 * returns a negative match if the number of values given to its parent
 * {@link match} function is not the same as the number of patterns it is given,
 * or if any of the values do not match their corresponding pattern value.
 */
const when = (pattern: ReadonlyArray<any>, result: any): Function => (
    values: ReadonlyArray<any>
): MatchResult => {
    if (pattern.length != values.length) return { matches: false }

    for (let i = 0; i < pattern.length; ++i) {
        if (pattern[i] === WILDCARD_VALUE) continue

        if (pattern[i]?.operator) {
            const { operator, elements }: Operation = pattern[i]
            switch (operator) {
                case 'either':
                    if (elements.some((elem) => elem === values[i])) continue
                    else return { matches: false }

                case 'neither':
                    if (elements.every((elem) => elem !== values[i])) continue
                    else return { matches: false }
            }
        }

        if (pattern[i] !== values[i]) return { matches: false }
    }

    return { matches: true, result }
}

/**
 * The exported alias to {@link WILDCARD_VALUE}. It serves as the wild card
 * matching operator.
 */
const _ = WILDCARD_VALUE

export { match, when, neither, either, _ }
