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

/** Whose ranking the library and the deck builder list cards by: how many
 * Commander decks on EDHREC play each card (Scryfall's card data carries
 * the rank). Named wherever the order is, and on the About page. */
export const EDHREC_URL = 'https://edhrec.com'

/** Where feedback goes: the landing page's button and the About page open
 * the visitor's mail program on it. */
export const FEEDBACK_EMAIL = 'toby@deckblitz.net'
export const FEEDBACK_SUBJECT = `${SITE_TITLE} feedback`

/** How the site was made, said up front so nobody has to ask. Words only,
 * no Anthropic logo: its trademark guidelines want approval before a logo
 * is used, and the note says there's no affiliation. */
export const BUILT_WITH = 'Built with Claude Code'
export const CLAUDE_CODE_URL = 'https://claude.com/product/claude-code'
export const BUILT_WITH_NOTE = `Yes, ${SITE_TITLE} was made with AI: its code was written with Claude Code, Anthropic's AI coding tool, directed and tested by one person. The card art is the real cards' art, none of it AI-generated. ${SITE_TITLE} isn't affiliated with or endorsed by Anthropic.`
/** The feedback address as a link that opens the visitor's mail program. */
export const FEEDBACK_HREF = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(FEEDBACK_SUBJECT)}`
