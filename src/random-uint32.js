import { randomInt } from './deps.js'


const MAX_UINT32 = Math.pow( 2, 32 ) - 1

export default function () {
    return randomInt(0, MAX_UINT32)
}
