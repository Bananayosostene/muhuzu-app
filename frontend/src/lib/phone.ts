/** Input props for Rwandan mobile numbers: MTN (078, 079) and Airtel (072, 073), ten digits. */
export const phoneField = {
  type: 'tel',
  inputMode: 'numeric',
  pattern: '07[2389][0-9]{7}',
  maxLength: 10,
  placeholder: '078 / 072 …',
  title: 'Ten digits starting with 078, 079, 072 or 073',
} as const

/** The backend stores phone numbers in E.164: 0788123456 becomes +250788123456. */
export const toE164 = (local: string) => `+250${local.trim().slice(1)}`

/** Back to what the person types: +250788123456 becomes 0788123456. */
export const fromE164 = (phone: string) => phone.replace(/^\+250/, '0')
