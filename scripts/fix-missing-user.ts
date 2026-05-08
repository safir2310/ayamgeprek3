import { db } from '../src/lib/db.ts'

// User ID from error logs
const MISSING_USER_ID = 'cmok8z8zo0000l9tm4y69dpy6'

async function fixMissingUser() {
  try {
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: MISSING_USER_ID }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.email)
      return
    }

    console.log('Creating missing user with ID:', MISSING_USER_ID)

    // Create the user with default data
    const user = await db.user.create({
      data: {
        id: MISSING_USER_ID,
        email: 'user@example.com',
        password: 'hashed_password_placeholder',
        name: 'Demo User',
        phone: '08123456789',
        address: 'Jl. Demo No. 123',
        memberLevel: 'Bronze',
        points: 100,
        stampCount: 5,
        starCount: 2,
        role: 'customer',
        theme: 'light',
        notificationSound: 'chime',
        profilePrivate: false,
        emailNotifications: true,
        smsNotifications: false,
      },
    })

    console.log('✅ User created successfully!')
    console.log('User ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('\nYou can now login with:')
    console.log('Email: user@example.com')
    console.log('Password: anypassword123')
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

fixMissingUser()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
