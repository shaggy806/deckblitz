import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, this creature deals 1 damage to any target.";

export default defineCard({
  name: "Forgeborn Oreads",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    }),
  ],
});
