import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all customers for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const member = searchParams.get('member')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      role: 'user' // Only fetch regular users, not admins
    }

    if (member === 'member') {
      where.isMember = true
    } else if (member === 'non-member') {
      where.isMember = false
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch customers from database with order counts
    const customers = await db.user.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await db.order.findMany({
          where: { userId: customer.id },
          orderBy: { createdAt: 'desc' },
          take: 1
        })

        const totalOrders = await db.order.count({
          where: { userId: customer.id }
        })

        const totalSpent = await db.order.aggregate({
          where: {
            userId: customer.id,
            paymentStatus: 'paid'
          },
          _sum: {
            finalAmount: true
          }
        })

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          memberCard: customer.memberCard,
          isMember: customer.isMember,
          memberLevel: customer.memberLevel,
          points: customer.points,
          stampCount: customer.stampCount,
          starCount: customer.starCount,
          totalOrders,
          totalSpent: totalSpent._sum.finalAmount || 0,
          lastOrderDate: orders[0]?.createdAt || null,
          createdAt: customer.createdAt
        }
      })
    )

    return NextResponse.json({
      success: true,
      customers: customersWithStats
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil pelanggan' },
      { status: 500 }
    )
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      phone,
      address,
      isMember
    } = body

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Nama dan nomor telepon wajib diisi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phone }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Pelanggan dengan email atau nomor telepon ini sudah ada' },
        { status: 400 }
      )
    }

    // Create customer
    const customer = await db.user.create({
      data: {
        name,
        email: email || null,
        phone,
        address: address || null,
        role: 'user',
        isMember: isMember || false,
        memberLevel: 'Bronze',
        memberCard: isMember ? `MEM-${Date.now().toString().slice(-6)}` : null,
        points: 0,
        stampCount: 0,
        starCount: 0
      }
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        memberCard: customer.memberCard,
        isMember: customer.isMember,
        memberLevel: customer.memberLevel,
        points: customer.points,
        stampCount: customer.stampCount,
        starCount: customer.starCount,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        createdAt: customer.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal membuat pelanggan' },
      { status: 500 }
    )
  }
}

// PUT - Update customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      id,
      name,
      email,
      phone,
      address,
      isMember
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pelanggan wajib diisi' },
        { status: 400 }
      )
    }

    // Update customer
    const customer = await db.user.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email !== undefined ? email : undefined,
        phone: phone || undefined,
        address: address !== undefined ? address : undefined,
        isMember: isMember !== undefined ? isMember : undefined,
        memberCard: isMember && !name?.startsWith('MEM-') ? `MEM-${Date.now().toString().slice(-6)}` : undefined
      }
    })

    // Get updated stats
    const totalOrders = await db.order.count({
      where: { userId: customer.id }
    })

    const totalSpent = await db.order.aggregate({
      where: {
        userId: customer.id,
        paymentStatus: 'paid'
      },
      _sum: {
        finalAmount: true
      }
    })

    const orders = await db.order.findMany({
      where: { userId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        memberCard: customer.memberCard,
        isMember: customer.isMember,
        memberLevel: customer.memberLevel,
        points: customer.points,
        stampCount: customer.stampCount,
        starCount: customer.starCount,
        totalOrders,
        totalSpent: totalSpent._sum.finalAmount || 0,
        lastOrderDate: orders[0]?.createdAt || null,
        createdAt: customer.createdAt
      }
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate pelanggan' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pelanggan wajib diisi' },
        { status: 400 }
      )
    }

    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Pelanggan berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus pelanggan' },
      { status: 500 }
    )
  }
}
