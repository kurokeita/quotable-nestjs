import ShortUniqueId from 'short-unique-id'

export default function generateShortId(length: number = 10): string {
	return new ShortUniqueId({ length }).rnd()
}
