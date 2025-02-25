export default interface PaginatedResponse<T> {
	data: T[]
	metadata: {
		total: number
		page: number
		lastPage: number
		hasNextPage: boolean
		hasPreviousPage: boolean
	}
}
