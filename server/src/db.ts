import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// BigInt is not JSON-serializable by default. Money leaves the API as a
// Number (safe: kobo values stay well under 2^53).
// Individual serializers in route handlers convert explicitly; this is a
// belt-and-suspenders guard for anything that slips through.
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  return Number(this);
};
