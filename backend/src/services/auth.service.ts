import bcrypt from 'bcryptjs'

/**
 * Hashes a plain text password using bcrypt.
 * @param password The password to hash.
 * @returns The hashed password string.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compares a plain text password with a stored hash.
 * @param password The plain text password.
 * @param hash The stored bcrypt hash.
 * @returns True if they match, false otherwise.
 */
export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}
