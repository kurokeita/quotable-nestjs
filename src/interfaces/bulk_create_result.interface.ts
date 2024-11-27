export interface BulkCreateResult<T> {
  input: number
  created: number
  skipped: number
  skippedData: Array<T>
}
