import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SALT_ROUNDS } from 'src/utils/constants';

@Injectable()
export class CryptoService {
  // ==================== Bcrypt Hashing (Passwords, OTPs) ====================

  /**
   * Hashes plain text data using bcrypt with a configurable salt round.
   * @param data Plain text to hash (e.g., password or OTP)
   * @param saltRounds Optional salt rounds (defaults to SALT_ROUNDS constant)
   * @returns The hashed string
   */
  async hash(data: string, saltRounds: number = SALT_ROUNDS): Promise<string> {
    return bcrypt.hash(data, saltRounds);
  }

  /**
   * Compares plain text data with a bcrypt hash.
   * @param data Plain text entered by the user
   * @param hashed Stored hash from the database
   * @returns True if they match, false otherwise
   */
  async compare(data: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(data, hashed);
  }

  // ==================== SHA-256 Hashing (Tokens) ====================

  /**
   * Hashes a raw token using SHA-256 for secure database storage.
   * @param rawToken Plain text token
   * @returns Hex representation of the SHA-256 hash
   */
  hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  // ==================== Random Generation Utilities ====================

  /**
   * Generates a cryptographically secure random hex string.
   * @param length Byte length (default: 32)
   */
  generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generates a numeric OTP padded with leading zeros if necessary.
   * @param length Number of digits (default: 6)
   */
  generateOTP(length: number = 6): string {
    const max = Math.pow(10, length);
    const randomInt = crypto.randomInt(0, max);
    return randomInt.toString().padStart(length, '0');
  }
}
