import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 28999. Devouring Rage's shape: "any number
// of creatures" is a sacrifice of X, X announced as it's cast (none at all
// included) and the creatures chosen as the cost is paid; +2/+2 for each.

export default defineCard({
  name: "Vicious Betrayal",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice any number of creatures.\nTarget creature gets +2/+2 until end of turn for each creature sacrificed this way.",
  additionalCost: { sacrifice: { type: "creature" }, sacrificeCount: "x" },
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { product: [2, "x"] },
    toughness: { product: [2, "x"] },
    duration: "end-of-turn",
  },
});
