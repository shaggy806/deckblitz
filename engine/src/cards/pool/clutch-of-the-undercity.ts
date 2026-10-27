import { defineCard } from "../define.js";
import { transmute } from "../helpers.js";

// EDHREC rank 14576.

const TRANSMUTE_TEXT =
  "Transmute {1}{U}{B} ({1}{U}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Clutch of the Undercity",
  manaCost: "{1}{U}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: `Return target permanent to its owner's hand. Its controller loses 3 life.\n${TRANSMUTE_TEXT}`,
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
    ],
  },
  activated: [transmute("{1}{U}{B}", 4, TRANSMUTE_TEXT)],
});
