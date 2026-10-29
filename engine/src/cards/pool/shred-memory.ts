import { defineCard } from "../define.js";
import { transmute } from "../helpers.js";

// EDHREC rank 8345.

const TRANSMUTE_TEXT =
  "Transmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Shred Memory",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Exile up to four target cards from a single graveyard.\n${TRANSMUTE_TEXT}`,
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any" },
      max: 4,
      sameController: true,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "exile", target: 0 },
  },
  activated: [transmute("{1}{B}{B}", 2, TRANSMUTE_TEXT)],
});
