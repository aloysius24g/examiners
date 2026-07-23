import { LRUCache } from "lru-cache";

const otpCache = new LRUCache<string, string>({
  max: 10_000,
  ttl: 1000 * 60 * 10,
  maxSize: 1024 * 1024,
  sizeCalculation: (value, key) => {
    return key.length + value.length;
  },
});

export async function getOtpByEmail(
  email: string,
): Promise<string | undefined> {
  return otpCache.get(email);
}

export async function setOtpByEmail(
  email: string,
  otp: string,
): Promise<void> {
  otpCache.set(email, otp);
}

export async function invalidateOtp(email: string): Promise<void> {
  otpCache.delete(email);
}
