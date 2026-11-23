import { STRONG_DECKS } from 'engine/client'
import {
  ART_RIGHTS,
  BUILT_WITH,
  BUILT_WITH_NOTE,
  CLAUDE_CODE_URL,
  EDHREC_URL,
  FEEDBACK_EMAIL,
  FEEDBACK_HREF,
  FAN_CONTENT_POLICY_URL,
  NOTICE_LEAD,
  NOTICE_REST,
  POLICY_NAME,
  SCRYFALL_URL,
  SITE_DESCRIPTOR,
  SITE_TITLE,
  SUPPORT_URL,
  TRADEMARK_LINE,
} from './notice.ts'
import './legal.css'

/**
 * `/about`: what Deck Blitz is, the Fan Content Policy notice in full, and
 * where its card data, images and the bots' strong decks come from. A
 * network-free page like the library: no room, no WebSocket, no card pool.
 */
export function AboutPage() {
  return (
    <main className="about-page">
      <a className="link-button about-home" href="/">
        ← Main menu
      </a>
      <h1>About &amp; legal</h1>
      <p className="about-lead">
        {SITE_TITLE} — {SITE_DESCRIPTOR}.
      </p>

      <section>
        <h2>Fan content</h2>
        <p>
          {NOTICE_LEAD}{' '}
          <a href={FAN_CONTENT_POLICY_URL} target="_blank" rel="noreferrer">
            {POLICY_NAME}
          </a>
          . {NOTICE_REST}
        </p>
        <p>
          Magic: The Gathering, its card names, rules text, mana symbols and card art are property of Wizards of the
          Coast. {ART_RIGHTS} {TRADEMARK_LINE} Each card&apos;s art is credited to its artist on the card, where the card is shown
          in full.
        </p>
      </section>

      <section>
        <h2>Card data and images</h2>
        <p>
          Card images and card data come from{' '}
          <a href={SCRYFALL_URL} target="_blank" rel="noreferrer">
            Scryfall
          </a>
          . {SITE_TITLE} isn&apos;t produced by, affiliated with or endorsed by Scryfall.
        </p>
        <p>
          Where the card library and the deck builder list cards by how much they&apos;re played, that is each
          card&apos;s rank on{' '}
          <a href={EDHREC_URL} target="_blank" rel="noreferrer">
            EDHREC
          </a>
          , as Scryfall&apos;s data carries it. {SITE_TITLE} isn&apos;t affiliated with or endorsed by EDHREC.
        </p>
      </section>

      <section>
        <h2>Players&apos; decks</h2>
        <p>
          A bot can be given a &ldquo;Strong&rdquo; deck: one of these real Commander decks that players built and shared on
          Archidekt or Moxfield, each named for its creator and played exactly as they listed it on{' '}
          {STRONG_DECKS[0]?.credit?.taken}, except where it says what was changed. Their own pages show their latest
          versions:
        </p>
        <ul className="about-credits">
          {STRONG_DECKS.map((deck) =>
            deck.credit === undefined ? null : (
              <li key={deck.name}>
                <a
                  href={deck.credit.url ?? `https://archidekt.com/decks/${deck.credit.archidektId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {deck.credit.title}
                </a>{' '}
                by {deck.credit.author} ({deck.commanders?.[0]})
                {deck.credit.changed === undefined ? null : `, with ${deck.credit.changed}`}
              </li>
            ),
          )}
        </ul>
        <p>
          {SITE_TITLE} isn&apos;t affiliated with or endorsed by Archidekt, Moxfield or these players.
        </p>
      </section>

      <section>
        <h2>Free to play</h2>
        <p>
          {SITE_TITLE} is free: no payments, subscriptions, ads or sign-up, and nothing on it is for sale. If
          you&apos;d like to help with what it costs to run, you can{' '}
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer">
            support it on Ko-fi
          </a>
          ; that&apos;s optional and unlocks nothing. {SITE_TITLE} isn&apos;t affiliated with or endorsed by Ko-fi.
        </p>
      </section>

      <section>
        <h2>{BUILT_WITH}</h2>
        <p>
          {BUILT_WITH_NOTE}{' '}
          <a href={CLAUDE_CODE_URL} target="_blank" rel="noreferrer">
            About Claude Code
          </a>
        </p>
      </section>

      <section>
        <h2>Privacy</h2>
        <p>
          {SITE_TITLE} counts visits, games and deck imports, and notes errors the page runs into, so its maker can
          see what gets used and what breaks. The counts are anonymous: no cookies, no accounts, no advertising or
          third-party trackers, and no IP address is stored, only the country a visit came from. An imported list is never kept, only its commander and
          the names of cards the site doesn&apos;t have yet. A finished game is kept for a while (the decks in it and the
          plays made, with nothing saying who played) so that a mistake by a bot or the rules can be found and fixed.
          So that ten games from one player aren&apos;t counted as ten players, each kept game carries a short code:
          your browser makes up a random number the first time you play, keeps it to itself, and sends only a code
          worked out from it. The same browser always gives the same code, and nothing leads back from the code to
          the number, your browser or you. It goes with kept games and nothing else, and clearing this site&apos;s data
          makes a new one. Your saved decks and settings stay in your browser.
        </p>
      </section>

      <section>
        <h2>Feedback</h2>
        <p>
          Found a bug, a card that plays wrong, or something you&apos;d like to see? Write to{' '}
          <a href={FEEDBACK_HREF}>{FEEDBACK_EMAIL}</a>.
        </p>
      </section>
    </main>
  )
}
