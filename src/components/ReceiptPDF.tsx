'use client'

import { useRef } from 'react'
import jsPDF from 'jspdf'

interface ReceiptPDFProps {
  order: any
  onClose?: () => void
}

export default function ReceiptPDF({ order, onClose }: ReceiptPDFProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!receiptRef.current) return

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 120], // Ukuran kertas thermal 80mm
    })

    const html2canvas = (await import('html2canvas')).default

    const canvas = await html2canvas(receiptRef.current, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png', 1.0)
    const imgWidth = 80
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`Struk-${order.orderNumber}.pdf`)
  }

  const printDirectly = () => {
    if (!receiptRef.current) return

    const printWindow = window.open('', '', 'width=400,height=800')
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Mohon izinkan popup di browser Anda.')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk ${order.orderNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              font-size: 10px;
              line-height: 1.2;
            }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'processing':
        return 'text-yellow-600'
      case 'pending':
        return 'text-orange-600'
      case 'cancelled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓ SELESAI'
      case 'processing':
        return '⏳ DIPROSES'
      case 'pending':
        return '📋 PENDING'
      case 'cancelled':
        return '✗ BATAL'
      default:
        return status.toUpperCase()
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview untuk cetak */}
      <div className="flex justify-center">
        <div
          ref={receiptRef}
          className="bg-white text-black p-4 text-[10px] leading-tight shadow-lg"
          style={{
            width: '80mm',
            fontFamily: 'Courier New, monospace',
          }}
        >
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-400 pb-3 mb-3">
            <h1 className="text-sm font-bold text-black mb-1 leading-tight">
              AYAM GEPREK SAMBAL IJO
            </h1>
            <p className="text-[9px] text-gray-700 leading-tight">
              Jl. Medan - Banda Aceh
            </p>
            <p className="text-[9px] text-gray-700 leading-tight">
              Simpang Camat, 24151
            </p>
            <p className="text-[9px] text-gray-700 leading-tight mt-1">
              Telp: 0812-3456-7890
            </p>
          </div>

          {/* Order Info */}
          <div className="mb-3 text-[9px]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 font-medium">No. Order:</span>
              <span className="font-bold text-black">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 font-medium">Tanggal:</span>
              <span className="text-black">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 font-medium">Pelanggan:</span>
              <span className="text-black">{order.customerName || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Pembayaran:</span>
              <span className="text-black">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Items Header */}
          <div className="border-t-2 border-b-2 border-dashed border-gray-400 py-2 mb-2 text-[9px] font-bold">
            <div className="grid grid-cols-[1fr_0.5fr_1.5fr] gap-1">
              <span className="text-left">ITEM</span>
              <span className="text-center">QTY</span>
              <span className="text-right">HARGA</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-3 text-[9px] space-y-1">
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-[1fr_0.5fr_1.5fr] gap-1">
                <div className="text-left">
                  <span className="font-medium">{item.name}</span>
                  {item.discountPrice && item.discountPrice < item.price && (
                    <span className="text-[8px] text-red-600 block leading-tight">
                      (Diskon {Math.round(((item.price - item.discountPrice) / item.price) * 100)}%)
                    </span>
                  )}
                </div>
                <span className="text-center font-medium">x{item.quantity}</span>
                <span className="text-right font-medium">
                  {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-gray-400 my-3"></div>

          {/* Totals */}
          <div className="space-y-1 text-[9px] mb-3">
            {order.subtotal && (
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-black">{formatCurrency(order.subtotal)}</span>
              </div>
            )}
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Diskon Voucher:</span>
                <span className="text-red-600 font-medium">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
            )}
            {order.tax && order.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Pajak (10%):</span>
                <span className="text-black">{formatCurrency(order.tax)}</span>
              </div>
            )}
            {order.deliveryFee && order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ongkir:</span>
                <span className="text-black">{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t-2 border-dashed border-gray-400 pt-2 mt-2">
              <span className="font-bold text-sm text-black">TOTAL</span>
              <span className="font-bold text-sm text-black">
                {formatCurrency(order.finalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="text-center mb-3 py-2 border-2 border-gray-400 rounded">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium text-[9px]">Status:</span>
              <span className={`font-bold text-[10px] ${getStatusColor(order.orderStatus)}`}>
                {getStatusText(order.orderStatus)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600 font-medium text-[9px]">Pembayaran:</span>
              <span className={`font-bold text-[10px] ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                {order.paymentStatus === 'paid' ? '✓ LUNAS' : '⏳ BELUM LUNAS'}
              </span>
            </div>
          </div>

          {/* Points Earned */}
          {order.pointsEarned !== undefined && order.pointsEarned > 0 && (
            <div className="text-center mb-3 py-2 bg-gray-100 rounded border border-gray-300">
              <p className="text-[9px] text-gray-700 font-medium">Poin yang didapat:</p>
              <p className="text-base font-bold text-amber-600">+{order.pointsEarned} POIN</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-dashed border-gray-400 pt-3 text-center">
            <p className="text-[9px] text-gray-700 mb-1 leading-tight">
              Terima kasih telah berbelanja!
            </p>
            <p className="text-[9px] text-gray-700 mb-2 leading-tight">
              Simpan struk ini untuk garansi
            </p>
            <div className="flex justify-center items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-amber-500 text-[10px]">★</span>
              ))}
            </div>
            <p className="text-[8px] text-gray-500 leading-tight">
              www.ayamgepreksambalijo.com
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={generatePDF}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
        <button
          onClick={printDirectly}
          className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  )
}
