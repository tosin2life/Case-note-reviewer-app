import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role?: string | null
      institution?: string | null
    }
  }

  interface User {
    role?: string | null
    institution?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string | null
    institution?: string | null
  }
}
