import { readCart } from '../../utils/cart'

export default defineEventHandler(event => readCart(event))
