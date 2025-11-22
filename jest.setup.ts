import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
// @ts-expect-error TextDecoder is not part of global type
global.TextDecoder = TextDecoder
