# Security Specification - UPTD SDN 1 GABUS KULON

## Data Invariants
- An archive item must have a title, category, date, and valid file URL.
- Only authenticated users with a specific role or matching the uploader ID can modify archive items.
- Staff members can only be modified by administrators.
- `createdAt` and `uploaderId` are immutable once set.
- All sizes must be constrained to prevent resource exhaustion.

## The "Dirty Dozen" Payloads (Red Team Audit)
1. **Identity Spoofing**: Regular user trying to set `uploaderId` to another user's UID.
2. **Privilege Escalation**: User trying to mark themselves as an admin in a hypothetical user profile.
3. **Shadow Update**: Adding a `isVerified: true` field to an archive document.
4. **ID Poisoning**: Using a 2KB string as a document ID.
5. **Type Poisoning**: Sending an integer where a string (title) is expected.
6. **Immutable Breach**: Attempting to change `createdAt` on an existing document.
7. **Size Exhaustion**: Sending a 1MB string for the `title` field.
8. **Orphaned Writes**: Creating an archive item without a required field like `fileUrl`.
9. **Relational Sync Break**: Deleting a parent document (hypothetical) without cleaning up sub-resources.
10. **PII Leak**: An unauthorized user trying to list all emails/NIPs (if restricted).
11. **Terminal State Bypass**: Updating a document after it has reached a "final" state (if applicable).
12. **Query Scraper**: Attempting to `list` all archives without any filters if the rule requires specific ownership.

## Test Runner (Security Rules Test Concept)
- `tests/archives.test.ts`: Verify that only owner/admin can write.
- `tests/staff.test.ts`: Verify that staff is read-only for public, write-only for admins.
