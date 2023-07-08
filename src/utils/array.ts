import { isDeepStrictEqual } from 'util';

function contains<T>(array: T[] | undefined | null, element: T): boolean {
    if (array == undefined || array == null || array.length == 0) {
        return false;
    }
    for (let i = 0; i < array.length; i++) {
        if (isDeepStrictEqual(element, array[i])) {
            return true;
        }
    }
    return false;
}

export default { contains };
