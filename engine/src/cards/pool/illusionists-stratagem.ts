import { defineCard } from "../define.js";

// Aether Revolt. Displace's flicker, then a draw. Cast with no targets it just
// draws; with targets that are all illegal as it resolves it does nothing (its
// rulings — rule 608.2b).
export default defineCard({
  name: "Illusionist's Stratagem",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Exile up to two target creatures you control, then return those cards to the battlefield under their owner's control.\nDraw a card.",
  targets: [
    { kind: "optional", of: "creature-you-control" },
    { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "flicker", target: [0, 1] },
      { kind: "draw", amount: 1 },
    ],
  },
});
