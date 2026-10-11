/** What the referral page shows for the signed-in user, once the backend provides it. */
export interface Referral {
  /** The personal code that goes in the link people share. */
  code: string
  /** How many people joined through the link. */
  invited: number
  /** What the user earned from their deals, as a decimal string in RWF. */
  earned: string
}

/**
 * The backend has no referral feature yet (README §20 `X5`), so this answers `null`
 * and the page shows "coming soon". When the endpoint exists, call it here with `api<Referral>(…)`;
 * the page needs no other change.
 */
export const getMyReferral = (): Promise<Referral | null> => Promise.resolve(null)
