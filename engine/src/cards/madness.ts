/**
 * Madness (rule 702.35) — the keyword's triggered ability. A card's
 * `madness` (`{ cost }`) is the static half: `Game` exiles the card instead
 * of putting it into the graveyard whenever it's discarded, and queues this
 * trigger for it, controlled by its owner, its source the card in exile.
 *
 * As it resolves, the owner is offered the card's cast for its madness cost
 * — an alternative cost (702.35b), so the only way — ignoring timing (rule
 * 608.2g); declined, or with no way to cast it, the card goes to its
 * graveyard. A card that has left exile by then is a new object (400.7): it
 * isn't offered, and stays where it is.
 */
import type { EffectSpec } from "../effects.js";

export const MADNESS_TEXT =
  "Madness — When this card is exiled this way, its owner may cast it by paying its madness cost rather than paying its mana cost. If that player doesn't, they put this card into their graveyard.";

export const MADNESS_EFFECT: EffectSpec = {
  kind: "cast-now",
  target: "source",
  madness: true,
  else: { kind: "put-into-graveyard", target: "source" },
};
