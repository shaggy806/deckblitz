import { defineCard } from "../define.js";
import { transmute } from "../helpers.js";

// Ravnica: City of Guilds (RAV). The exiled cards are exiled face up and
// linked to nothing; the rest go back on top in the caster's order.

const TEXT =
  "Look at the top three cards of target player's library. Exile any number of those cards, then put the rest back in any order.";
const TRANSMUTE_TEXT =
  "Transmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Dimir Machinations",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${TEXT}\n${TRANSMUTE_TEXT}`,
  targets: ["player"],
  effect: {
    kind: "look-and-choose",
    from: { target: 0 },
    zone: "library",
    count: 3,
    min: 0,
    max: 3,
    destination: "exile",
    unlinked: true,
    leftover: "top-any-order",
  },
  activated: [transmute("{1}{B}{B}", 3, TRANSMUTE_TEXT)],
});
