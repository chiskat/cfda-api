import { resolve } from 'path'
import { str } from '../lib/str.js'

const rootPath = (...args) => resolve(__dirname, `../`, str(...args))
rootPath[Symbol.toPrimitive] = () => resolve(__dirname, `../`)

export const $rootPath = rootPath
