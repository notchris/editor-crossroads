export default function createArray (size, fill) {
    const result = [ ]
    for (let i=0; i < size; i++)
        result.push(fill)

    return result
}
