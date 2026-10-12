import { defineCard } from "../define.js";

export default defineCard({
  name: "Slingshot Goblin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: "{R}, {T}: This creature deals 2 damage to target blue creature.",
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["U"], type: "creature" } }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}, {T}: This creature deals 2 damage to target blue creature.",
    },
  ],
});
