import { transmute } from "../helpers.js";
import { defineCard } from "../define.js";

// Dissension. "Discards their hand" is every card in it, so an empty hand can
// still take this way out.

const TRANSMUTE =
  "Transmute {1}{U}{B} ({1}{U}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Perplex",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: `Counter target spell unless its controller discards their hand.\n${TRANSMUTE}`,
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [
      {
        doing: { kind: "discard", target: "you", amount: { cardsInHand: "you" } },
        text: "Discard your hand",
      },
    ],
    otherwise: { kind: "counter", target: 0 },
  },
  activated: [transmute("{1}{U}{B}", 3, TRANSMUTE)],
});
