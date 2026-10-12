import { defineCard } from "../define.js";

export default defineCard({
  name: "Treefolk Healer",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Cleric"],
  power: 2,
  toughness: 3,
  text: "{2}{W}, {T}: Prevent the next 2 damage that would be dealt to any target this turn.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{2}{W}, {T}: Prevent the next 2 damage that would be dealt to any target this turn.",
    },
  ],
});
