import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Fetch admin settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Trust the token's role directly instead of querying database
    if (decoded.role !== 'admin') {
      console.log('[API] User is not admin, role from token:', decoded.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get or create admin settings
    let settings = await db.adminSettings.findFirst()

    // If no settings exist, create default settings
    if (!settings) {
      settings = await db.adminSettings.create({
        data: {},
      })
    }

    // Parse JSON strings
    const defaultPaymentMethods = settings.defaultPaymentMethods
      ? JSON.parse(settings.defaultPaymentMethods)
      : ['QRIS', 'Cash', 'COD']

    const businessHours = settings.businessHours
      ? JSON.parse(settings.businessHours)
      : {
          monday: { open: '08:00', close: '22:00', isOpen: true },
          tuesday: { open: '08:00', close: '22:00', isOpen: true },
          wednesday: { open: '08:00', close: '22:00', isOpen: true },
          thursday: { open: '08:00', close: '22:00', isOpen: true },
          friday: { open: '08:00', close: '22:00', isOpen: true },
          saturday: { open: '08:00', close: '23:00', isOpen: true },
          sunday: { open: '09:00', close: '21:00', isOpen: true },
        }

    const dashboardLayout = settings.dashboardLayout
      ? JSON.parse(settings.dashboardLayout)
      : null

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        storeName: settings.storeName,
        storeDescription: settings.storeDescription,
        storeAddress: settings.storeAddress,
        storePhone: settings.storePhone,
        storeEmail: settings.storeEmail,
        businessHours,
        taxRate: settings.taxRate,
        currency: settings.currency,
        pointMultiplier: settings.pointMultiplier,
        redemptionMultiplier: settings.redemptionMultiplier,
        defaultPaymentMethods,
        enableLoyaltyProgram: settings.enableLoyaltyProgram,
        loyaltyPointsPerRp: settings.loyaltyPointsPerRp,
        minOrderForPoints: settings.minOrderForPoints,
        autoApprovePayments: settings.autoApprovePayments,
        sendNotifications: settings.sendNotifications,
        backupEnabled: settings.backupEnabled,
        lastBackupDate: settings.lastBackupDate,
        dashboardLayout,
        theme: settings.theme,
        language: settings.language,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    })
  } catch (error) {
    console.error('[API] Error fetching admin settings:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil pengaturan admin' },
      { status: 500 }
    )
  }
}

// POST - Update admin settings
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Trust the token's role directly instead of querying database
    if (decoded.role !== 'admin') {
      console.log('[API] User is not admin, role from token:', decoded.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Get existing settings or create new one
    let settings = await db.adminSettings.findFirst()

    if (!settings) {
      // Create new settings
      settings = await db.adminSettings.create({
        data: {
          storeName: body.storeName,
          storeDescription: body.storeDescription,
          storeAddress: body.storeAddress,
          storePhone: body.storePhone,
          storeEmail: body.storeEmail,
          businessHours: body.businessHours ? JSON.stringify(body.businessHours) : undefined,
          taxRate: body.taxRate,
          currency: body.currency,
          pointMultiplier: body.pointMultiplier,
          redemptionMultiplier: body.redemptionMultiplier,
          defaultPaymentMethods: body.defaultPaymentMethods
            ? JSON.stringify(body.defaultPaymentMethods)
            : undefined,
          enableLoyaltyProgram: body.enableLoyaltyProgram,
          loyaltyPointsPerRp: body.loyaltyPointsPerRp,
          minOrderForPoints: body.minOrderForPoints,
          autoApprovePayments: body.autoApprovePayments,
          sendNotifications: body.sendNotifications,
          backupEnabled: body.backupEnabled,
          dashboardLayout: body.dashboardLayout ? JSON.stringify(body.dashboardLayout) : undefined,
          theme: body.theme,
          language: body.language,
        },
      })
    } else {
      // Update existing settings
      settings = await db.adminSettings.update({
        where: { id: settings.id },
        data: {
          ...(body.storeName !== undefined && { storeName: body.storeName }),
          ...(body.storeDescription !== undefined && { storeDescription: body.storeDescription }),
          ...(body.storeAddress !== undefined && { storeAddress: body.storeAddress }),
          ...(body.storePhone !== undefined && { storePhone: body.storePhone }),
          ...(body.storeEmail !== undefined && { storeEmail: body.storeEmail }),
          ...(body.businessHours !== undefined && {
            businessHours: JSON.stringify(body.businessHours),
          }),
          ...(body.taxRate !== undefined && { taxRate: body.taxRate }),
          ...(body.currency !== undefined && { currency: body.currency }),
          ...(body.pointMultiplier !== undefined && { pointMultiplier: body.pointMultiplier }),
          ...(body.redemptionMultiplier !== undefined && {
            redemptionMultiplier: body.redemptionMultiplier,
          }),
          ...(body.defaultPaymentMethods !== undefined && {
            defaultPaymentMethods: JSON.stringify(body.defaultPaymentMethods),
          }),
          ...(body.enableLoyaltyProgram !== undefined && {
            enableLoyaltyProgram: body.enableLoyaltyProgram,
          }),
          ...(body.loyaltyPointsPerRp !== undefined && {
            loyaltyPointsPerRp: body.loyaltyPointsPerRp,
          }),
          ...(body.minOrderForPoints !== undefined && {
            minOrderForPoints: body.minOrderForPoints,
          }),
          ...(body.autoApprovePayments !== undefined && {
            autoApprovePayments: body.autoApprovePayments,
          }),
          ...(body.sendNotifications !== undefined && {
            sendNotifications: body.sendNotifications,
          }),
          ...(body.backupEnabled !== undefined && { backupEnabled: body.backupEnabled }),
          ...(body.dashboardLayout !== undefined && {
            dashboardLayout: JSON.stringify(body.dashboardLayout),
          }),
          ...(body.theme !== undefined && { theme: body.theme }),
          ...(body.language !== undefined && { language: body.language }),
        },
      })
    }

    // Parse JSON strings for response
    const defaultPaymentMethods = settings.defaultPaymentMethods
      ? JSON.parse(settings.defaultPaymentMethods)
      : ['QRIS', 'Cash', 'COD']

    const businessHours = settings.businessHours
      ? JSON.parse(settings.businessHours)
      : undefined

    const dashboardLayout = settings.dashboardLayout
      ? JSON.parse(settings.dashboardLayout)
      : undefined

    return NextResponse.json({
      success: true,
      message: 'Pengaturan admin berhasil disimpan',
      settings: {
        id: settings.id,
        storeName: settings.storeName,
        storeDescription: settings.storeDescription,
        storeAddress: settings.storeAddress,
        storePhone: settings.storePhone,
        storeEmail: settings.storeEmail,
        businessHours,
        taxRate: settings.taxRate,
        currency: settings.currency,
        pointMultiplier: settings.pointMultiplier,
        redemptionMultiplier: settings.redemptionMultiplier,
        defaultPaymentMethods,
        enableLoyaltyProgram: settings.enableLoyaltyProgram,
        loyaltyPointsPerRp: settings.loyaltyPointsPerRp,
        minOrderForPoints: settings.minOrderForPoints,
        autoApprovePayments: settings.autoApprovePayments,
        sendNotifications: settings.sendNotifications,
        backupEnabled: settings.backupEnabled,
        lastBackupDate: settings.lastBackupDate,
        dashboardLayout,
        theme: settings.theme,
        language: settings.language,
        updatedAt: settings.updatedAt,
      },
    })
  } catch (error) {
    console.error('[API] Error updating admin settings:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan pengaturan admin' },
      { status: 500 }
    )
  }
}
