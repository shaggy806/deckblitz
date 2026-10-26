import { defineCard } from "../define.js";

export default defineCard({
  name: "Rockcaster Platoon",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 5,
  toughness: 7,
  text: "{4}{G}: This creature deals 2 damage to each creature with flying and each player.",
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: 2 },
          { kind: "damage", amount: 2, who: "each-player" },
        ],
      },
      resolve: null,
      text: "{4}{G}: This creature deals 2 damage to each creature with flying and each player.",
    },
  ],
});
