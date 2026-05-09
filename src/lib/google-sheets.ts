import { google } from 'googleapis'

// Environment variables for Google Sheets API
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || ''
const SHEET_NAME = 'Pesanan'

// Initialize Google Sheets API
export async function getSheetsClient() {
  try {
    // For production, you should use a Service Account key file
    // Set GOOGLE_SHEETS_KEY_FILE environment variable with path to key file
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SHEETS_KEY_FILE || './google-sheets-key.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    return sheets
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error)
    return null
  }
}

// Append order to Google Sheets
export async function appendOrderToSheet(orderData: any) {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, skipping sheet sync')
      return null
    }

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    })

    // Prepare row data
    const rowData = [
      timestamp, // Timestamp
      orderData.orderNumber || '', // Order Number
      orderData.customerName || '', // Customer Name
      orderData.customerPhone || '', // Phone
      orderData.customerAddress || '', // Address
      orderData.totalAmount || 0, // Total Amount
      orderData.finalAmount || 0, // Final Amount
      orderData.discountAmount || 0, // Discount
      orderData.paymentMethod || '', // Payment Method
      orderData.voucherCode || '', // Voucher Code
      JSON.stringify(orderData.items || []), // Items (JSON)
      orderData.notes || '', // Notes
      orderData.paymentStatus || 'pending', // Payment Status
      orderData.orderStatus || 'pending', // Order Status
    ]

    // Append to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:M`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    })

    console.log('Order appended to Google Sheets:', response.data)
    return response.data
  } catch (error) {
    console.error('Error appending order to Google Sheets:', error)
    throw error
  }
}

// Create/update order in Google Sheets
export async function updateOrderInSheet(orderData: any) {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured, skipping sheet sync')
      return null
    }

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    })

    // Prepare row data
    const rowData = [
      timestamp, // Timestamp
      orderData.orderNumber || '', // Order Number
      orderData.customerName || '', // Customer Name
      orderData.customerPhone || '', // Phone
      orderData.customerAddress || '', // Address
      orderData.totalAmount || 0, // Total Amount
      orderData.finalAmount || 0, // Final Amount
      orderData.discountAmount || 0, // Discount
      orderData.paymentMethod || '', // Payment Method
      orderData.voucherCode || '', // Voucher Code
      JSON.stringify(orderData.items || []), // Items (JSON)
      orderData.notes || '', // Notes
      orderData.paymentStatus || 'pending', // Payment Status
      orderData.orderStatus || 'pending', // Order Status
    ]

    // Append to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:M`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    })

    console.log('Order updated in Google Sheets:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating order in Google Sheets:', error)
    throw error
  }
}

// Get all orders from Google Sheets
export async function getOrdersFromSheet() {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured')
      return []
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:M`,
    })

    const rows = response.data.values || []
    const headers = rows[0] || []
    const data = rows.slice(1).map((row: any) => {
      const order: any = {}
      headers.forEach((header: string, index: number) => {
        order[header] = row[index]
      })
      return order
    })

    return data
  } catch (error) {
    console.error('Error getting orders from Google Sheets:', error)
    return []
  }
}

// Initialize sheet with headers if not exists
export async function initializeSheet() {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured')
      return
    }

    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === SHEET_NAME
    )

    if (!sheetExists) {
      // Create sheet with headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                },
              },
            },
          ],
        },
      })

      // Add headers
      const headers = [
        'Timestamp',
        'Order Number',
        'Customer Name',
        'Phone',
        'Address',
        'Total Amount',
        'Final Amount',
        'Discount',
        'Payment Method',
        'Voucher Code',
        'Items',
        'Notes',
        'Payment Status',
        'Order Status',
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:P1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      })

      console.log('Sheet initialized with headers')
    }
  } catch (error) {
    console.error('Error initializing sheet:', error)
  }
}

// Product Sheet Name
const PRODUCT_SHEET_NAME = 'Produk'

// Get all products from Google Sheets
export async function getProductsFromSheet() {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured for products')
      return []
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PRODUCT_SHEET_NAME}!A:P`,
    })

    const rows = response.data.values || []

    if (rows.length === 0) {
      return []
    }

    const headers = rows[0]
    const data = rows.slice(1).map((row: any) => {
      const product: any = {}
      headers.forEach((header: string, index: number) => {
        const value = row[index]

        // Parse numeric values
        if (['price', 'discountPrice', 'stock', 'soldCount', 'rating'].includes(header)) {
          product[header] = value ? parseFloat(value) : 0
        }
        // Parse boolean values
        else if (header === 'featured') {
          product[header] = value === 'true' || value === true
        }
        // Parse category object
        else if (header === 'category') {
          try {
            product[header] = value ? JSON.parse(value) : null
          } catch {
            product[header] = null
          }
        }
        // Other values as strings
        else {
          product[header] = value || ''
        }
      })
      return product
    })

    return data
  } catch (error) {
    console.error('Error getting products from Google Sheets:', error)
    return []
  }
}

// Get a single product by ID from Google Sheets
export async function getProductByIdFromSheet(productId: string) {
  try {
    const products = await getProductsFromSheet()
    return products.find((p: any) => p.id === productId) || null
  } catch (error) {
    console.error('Error getting product from Google Sheets:', error)
    return null
  }
}

// Initialize products sheet with headers if not exists
export async function initializeProductSheet() {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured for products')
      return
    }

    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === PRODUCT_SHEET_NAME
    )

    if (!sheetExists) {
      // Create sheet with headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: PRODUCT_SHEET_NAME,
                },
              },
            },
          ],
        },
      })

      // Add headers
      const headers = [
        'ID',
        'Name',
        'Slug',
        'Description',
        'Price',
        'Discount Price',
        'Stock',
        'Barcode',
        'Image',
        'Category',
        'Featured',
        'Sold Count',
        'Rating',
        'Created At',
        'Updated At',
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCT_SHEET_NAME}!A1:O1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers],
        },
      })

      console.log('Product sheet initialized with headers')
    }
  } catch (error) {
    console.error('Error initializing product sheet:', error)
  }
}

// Sync product to Google Sheets (create or update)
export async function syncProductToSheet(product: any) {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured for products')
      return null
    }

    // Ensure sheet exists
    await initializeProductSheet()

    // Check if product already exists
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PRODUCT_SHEET_NAME}!A:P`,
    })

    const rows = response.data.values || []
    let rowIndex = -1

    if (rows.length > 1) {
      // Find existing product by ID
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === product.id) {
          rowIndex = i + 1
          break
        }
      }
    }

    // Prepare row data
    const rowData = [
      product.id || '',
      product.name || '',
      product.slug || '',
      product.description || '',
      product.price || 0,
      product.discountPrice || '',
      product.stock || 0,
      product.barcode || '',
      product.image || '',
      product.category ? JSON.stringify(product.category) : '',
      product.featured ? 'true' : 'false',
      product.soldCount || 0,
      product.rating || 0,
      product.createdAt || new Date().toISOString(),
      product.updatedAt || new Date().toISOString(),
    ]

    // Update existing or append new
    if (rowIndex > 0) {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCT_SHEET_NAME}!A${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      })

      console.log('Product updated in Google Sheets:', product.id)
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCT_SHEET_NAME}!A:P`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowData],
        },
      })

      console.log('Product added to Google Sheets:', product.id)
    }

    return { success: true }
  } catch (error) {
    console.error('Error syncing product to Google Sheets:', error)
    throw error
  }
}

// Update product stock in Google Sheets
export async function updateProductStockInSheet(productId: string, quantityChange: number) {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured for products')
      return null
    }

    // Get all products
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PRODUCT_SHEET_NAME}!A:P`,
    })

    const rows = response.data.values || []
    let rowIndex = -1
    let currentStock = 0

    if (rows.length > 1) {
      // Find product by ID
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === productId) {
          rowIndex = i + 1
          currentStock = parseInt(rows[i][6]) || 0
          break
        }
      }
    }

    if (rowIndex > 0) {
      const newStock = currentStock + quantityChange

      // Update stock column (G)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCT_SHEET_NAME}!G${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[newStock]],
        },
      })

      console.log(`Product stock updated: ${productId} from ${currentStock} to ${newStock}`)
      return { success: true, newStock }
    } else {
      console.warn('Product not found in Google Sheets:', productId)
      return null
    }
  } catch (error) {
    console.error('Error updating product stock in Google Sheets:', error)
    throw error
  }
}

// Increment product sold count in Google Sheets
export async function incrementProductSoldCountInSheet(productId: string, quantity: number) {
  try {
    const sheets = await getSheetsClient()

    if (!sheets || !SPREADSHEET_ID) {
      console.warn('Google Sheets not configured for products')
      return null
    }

    // Get all products
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PRODUCT_SHEET_NAME}!A:P`,
    })

    const rows = response.data.values || []
    let rowIndex = -1
    let currentSoldCount = 0

    if (rows.length > 1) {
      // Find product by ID
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === productId) {
          rowIndex = i + 1
          currentSoldCount = parseInt(rows[i][11]) || 0
          break
        }
      }
    }

    if (rowIndex > 0) {
      const newSoldCount = currentSoldCount + quantity

      // Update sold count column (L)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCT_SHEET_NAME}!L${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[newSoldCount]],
        },
      })

      console.log(`Product sold count updated: ${productId} from ${currentSoldCount} to ${newSoldCount}`)
      return { success: true, newSoldCount }
    } else {
      console.warn('Product not found in Google Sheets:', productId)
      return null
    }
  } catch (error) {
    console.error('Error incrementing product sold count in Google Sheets:', error)
    throw error
  }
}
