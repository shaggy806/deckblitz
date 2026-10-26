import { defineCard } from "../define.js";

// EDHREC rank 20534. Future Sight.
//
// The first ability hits Scourge itself if it has lost flying (the ruling):
// `damage-all` with no `exceptSource`.

export default defineCard({
  name: "Scourge of Kher Ridges",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\n{1}{R}: This creature deals 2 damage to each creature without flying.\n{5}{R}: This creature deals 6 damage to each other creature with flying.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 2 },
      resolve: null,
      text: "{1}{R}: This creature deals 2 damage to each creature without flying.",
    },
    {
      cost: { mana: "{5}{R}", tap: false },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", keyword: "flying" },
        amount: 6,
        exceptSource: true,
      },
      resolve: null,
      text: "{5}{R}: This creature deals 6 damage to each other creature with flying.",
    },
  ],
});
