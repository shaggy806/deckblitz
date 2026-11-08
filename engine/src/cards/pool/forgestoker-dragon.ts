import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "{1}{R}: This creature deals 1 damage to target creature. That creature can't block this combat. Activate only if this creature is attacking.";

export default defineCard({
  name: "Forgestoker Dragon",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\n" + ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      condition: { kind: "source", filter: { attacking: true } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "restrict", target: 0, restrictions: ["cant-block"], duration: "until-end-of-combat" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
