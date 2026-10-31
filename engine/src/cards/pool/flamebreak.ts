import { defineCard } from "../define.js";

// Tempest. EDHREC rank 19718. Earthquake's shape at 3, then every creature
// the damage reached can't be regenerated this turn — one whose damage was
// prevented wasn't dealt any.

export default defineCard({
  name: "Flamebreak",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Flamebreak deals 3 damage to each creature without flying and each player. Creatures dealt damage this way can't be regenerated this turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 3 },
          { kind: "damage", amount: 3, who: "each-player" },
        ],
      },
      { kind: "prohibit", regeneration: true, dealtDamageThisWay: "creature" },
    ],
  },
});
