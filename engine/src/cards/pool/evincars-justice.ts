import { defineCard } from "../define.js";

export default defineCard({
  name: "Evincar's Justice",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nEvincar's Justice deals 2 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
      { kind: "damage", amount: 2, who: "each-player" },
    ],
  },
});
