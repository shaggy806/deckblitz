import { defineCard } from "../define.js";

// EDHREC rank 25748.

export default defineCard({
  name: "Centaur's Herald",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 0,
  toughness: 1,
  text: "{2}{G}, Sacrifice this creature: Create a 3/3 green Centaur creature token.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Centaur Token", count: 1 },
      resolve: null,
      text: "{2}{G}, Sacrifice this creature: Create a 3/3 green Centaur creature token.",
    },
  ],
});
