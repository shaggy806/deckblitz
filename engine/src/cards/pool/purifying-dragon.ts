import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, it deals 1 damage to target creature defending player controls. If that creature is a Zombie, this creature deals 2 damage to it instead.";

export default defineCard({
  name: "Purifying Dragon",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      // Hexgold Slash's shape: whether it's a Zombie is read on resolution.
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Zombie" } },
        then: { kind: "damage", amount: 2, target: 0 },
        else: { kind: "damage", amount: 1, target: 0 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
