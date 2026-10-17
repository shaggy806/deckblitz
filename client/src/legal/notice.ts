/**
 * The notices Deck Blitz carries as Wizards of the Coast fan content, in the
 * words the Fan Content Policy asks for ("[Title of your Fan Content] is
 * unofficial Fan Content permitted under the Fan Content Policy. Not
 * approved/endorsed by Wizards. Portions of the materials used are property
 * of Wizards of the Coast. ©Wizards of the Coast LLC."). Kept in one place so
 * the footer and the About page can't drift apart. Why and where they show:
 * `docs/plans/fan-content-policy.md`.
 */

/** The fan content's title, as the notice names it — the brand alone, with
 * no Wizards trademark in it; "Magic: The Gathering" appears only to say
 * what the site is for (`SITE_DESCRIPTOR`), as Scryfall and Moxfield do. */
export const SITE_TITLE = 'Deck Blitz'

/** What the site is, naming the game it's for. */
export const SITE_DESCRIPTOR = 'A Commander deck tester for Magic: The Gathering'

export const FAN_CONTENT_POLICY_URL = 'https://company.wizards.com/en/legal/fancontentpolicy'

/** "… is unofficial Fan Content permitted under the" — then the policy's
 * name, which the footer and About page link. */
export const NOTICE_LEAD = `${SITE_TITLE} is unofficial Fan Content permitted under the`
export const POLICY_NAME = 'Fan Content Policy'
export const NOTICE_REST =
  'Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.'

/** Beside the notice, the user's addition to be safe (2026-10-16). */
export const ART_RIGHTS = 'All card art and its licenses belong to Wizards of the Coast.'

/** Whose the game's name is, in the trademark line fan sites carry. */
export const TRADEMARK_LINE = 'Magic: The Gathering and its logos are trademarks of Wizards of the Coast LLC.'

export const SCRYFALL_URL = 'https://scryfall.com'
