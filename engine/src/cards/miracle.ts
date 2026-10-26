/**
 * Miracle (rule 702.94) — the keyword's triggered ability. A card's
 * `miracle` (`{ cost }`) is the static half: as its owner draws it as the
 * first card they've drawn this turn, `Game` queues this trigger for it,
 * controlled by its owner, its source the card in hand — and asks them,
 * before it goes on the stack, whether to reveal the card
 * (`decisions/miracle-reveal.ts`); declined, there is no trigger.
 *
 * As it resolves, the owner may cast the card for its miracle cost — an
 * alternative cost, so the only way — ignoring timing (rule 608.2g). A card
 * that has left the hand by then is a new object (400.7) and isn't offered;
 * declined, it simply stays in hand.
 */
import type { EffectSpec } from "../effects.js";

export const MIRACLE_TEXT =
  "Miracle — When you reveal this card this way, you may cast it by paying its miracle cost rather than its mana cost.";

export const MIRACLE_EFFECT: EffectSpec = {
  kind: "cast-now",
  target: "source",
  miracle: true,
};
