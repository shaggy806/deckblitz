import { defineCard } from "../define.js";

/** The revealed nonland cards go to the bottom before the clash (its
 * ruling): the `reveal-until` finishes, then the clash. */
export default defineCard({
  name: "Recross the Paths",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal cards from the top of your library until you reveal a land card. Put that card onto the battlefield and the rest on the bottom of your library in any order. Clash with an opponent. If you win, return Recross the Paths to its owner's hand. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-until", filter: { type: "land" }, put: "battlefield", rest: "bottom-any-order" },
      { kind: "clash", won: { kind: "return-to-hand", target: "source", from: "stack" } },
    ],
  },
});
