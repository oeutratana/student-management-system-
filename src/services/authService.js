export const login = async (credentials) => {
  return {
    token: 'demo-token',
    user: {
      email: credentials.email,
      name: 'Admin',
    },
  }
}
