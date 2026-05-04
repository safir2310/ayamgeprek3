import { saveAs } from 'file-saver'

export interface DownloadExcelOptions {
  filename?: string
  onError?: (error: Error) => void
}

/**
 * Download Excel file from API endpoint
 * @param url - API endpoint URL
 * @param options - Download options
 */
export async function downloadExcel(
  url: string,
  options: DownloadExcelOptions = {}
): Promise<void> {
  const { filename, onError } = options

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    // Get filename from Content-Disposition header if not provided
    let downloadFilename = filename
    if (!downloadFilename) {
      const contentDisposition = response.headers.get('Content-Disposition')
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
        if (matches && matches[1]) {
          downloadFilename = matches[1].replace(/['"]/g, '')
        }
      }
    }

    // Get blob from response
    const blob = await response.blob()

    // Save file using file-saver
    saveAs(blob, downloadFilename || 'export.xlsx')
  } catch (error) {
    console.error('Error downloading Excel file:', error)
    if (onError) {
      onError(error instanceof Error ? error : new Error('Unknown error'))
    }
    throw error
  }
}

/**
 * Download products Excel
 */
export async function downloadProductsExcel(): Promise<void> {
  return downloadExcel('/api/export/products')
}

/**
 * Download orders Excel
 */
export async function downloadOrdersExcel(): Promise<void> {
  return downloadExcel('/api/export/orders')
}

/**
 * Download users Excel
 */
export async function downloadUsersExcel(): Promise<void> {
  return downloadExcel('/api/export/users')
}

/**
 * Download vouchers Excel
 */
export async function downloadVouchersExcel(): Promise<void> {
  return downloadExcel('/api/export/vouchers')
}
