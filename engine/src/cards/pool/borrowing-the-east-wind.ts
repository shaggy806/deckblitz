import { defineCard } from "../define.js";

// Portal Three Kingdoms. EDHREC rank 26981.
//
// Rolling Earthquake's mirror: one simultaneous damage event to each creature
// with horsemanship and each player.

export default defineCard({
  name: "Borrowing the East Wind",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Borrowing the East Wind deals X damage to each creature with horsemanship and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature", keyword: "horsemanship" }, amount: "x" },
      { kind: "damage", amount: "x", who: "each-player" },
    ],
  },
});
