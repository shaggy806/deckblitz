import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 30125. Earthquake's shape, X the number of
// Beasts on the battlefield (anyone's) as it resolves.

const BEASTS = { countOf: { subtype: "Beast" } } as const;

export default defineCard({
  name: "Thunder of Hooves",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Thunder of Hooves deals X damage to each creature without flying and each player, where X is the number of Beasts on the battlefield.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: BEASTS },
      { kind: "damage", amount: BEASTS, who: "each-player" },
    ],
  },
});
