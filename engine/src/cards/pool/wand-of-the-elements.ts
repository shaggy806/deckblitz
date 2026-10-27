import { defineCard } from "../define.js";

export default defineCard({
  name: "Wand of the Elements",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{T}, Sacrifice an Island: Create a 2/2 blue Elemental creature token with flying.\n{T}, Sacrifice a Mountain: Create a 3/3 red Elemental creature token.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Island" } } },
      targets: [],
      effect: { kind: "create-token", token: "2/2 Blue Elemental Token (Flying)", count: 1 },
      resolve: null,
      text: "{T}, Sacrifice an Island: Create a 2/2 blue Elemental creature token with flying.",
    },
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Mountain" } } },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Red Elemental Token", count: 1 },
      resolve: null,
      text: "{T}, Sacrifice a Mountain: Create a 3/3 red Elemental creature token.",
    },
  ],
});
