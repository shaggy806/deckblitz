import {
  ART_RIGHTS,
  FAN_CONTENT_POLICY_URL,
  NOTICE_LEAD,
  NOTICE_REST,
  POLICY_NAME,
  SCRYFALL_URL,
  SITE_DESCRIPTOR,
  SITE_TITLE,
  TRADEMARK_LINE,
} from './notice.ts'
import './legal.css'

/**
 * `/about`: what Deck Blitz is, the Fan Content Policy notice in full, and
 * where its card data and images come from. A network-free page like the
 * library: no room, no WebSocket, no card pool.
 */
export function AboutPage() {
  return (
    <main className="about-page">
      <a className="about-home" href="/">
        ← {SITE_TITLE}
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
      </section>

      <section>
        <h2>Free to play</h2>
        <p>
          {SITE_TITLE} is free: no payments, subscriptions, ads or sign-up, and nothing on it is for sale.
        </p>
      </section>
    </main>
  )
}
